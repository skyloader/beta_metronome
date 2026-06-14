import AccessToken from "../models/access-token.js";
import axios from "axios";
import qs from 'qs';
import { recursiveDasherizeKeys } from "../utils/json-util.js";
import _ from 'lodash';
const ParamsSerializer = {
    serialize: function (queryParams) {
        return qs.stringify(queryParams, { arrayFormat: 'brackets' });
    }
};
const ApiVersionRegex = /^\d{8}$/;
export default class TastytradeHttpClient {
    constructor(clientConfig, logger) {
        this.logger = logger;
        this.baseUrl = clientConfig.baseUrl;
        this.accessToken = new AccessToken();
        this.clientSecret = clientConfig.clientSecret;
        this.refreshToken = clientConfig.refreshToken;
        this.oauthScopes = clientConfig.oauthScopes;
        this.updateConfig(clientConfig);
    }
    updateConfig(config) {
        const httpClientConfig = _.pick(config, ['clientSecret', 'refreshToken', 'oauthScopes', 'targetApiVersion']);
        if (!_.isEmpty(httpClientConfig)) {
            Object.assign(this, httpClientConfig);
            this.accessToken.clear();
        }
    }
    get needsTokenRefresh() {
        return this.accessToken.isExpired;
    }
    get authHeader() {
        if (this.accessToken.isValid) {
            return this.accessToken.authorizationHeader;
        }
        return null;
    }
    getDefaultHeaders() {
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": this.authHeader
        };
        if (!_.isNil(this.targetApiVersion)) {
            headers["Accept-Version"] = this.targetApiVersion;
        }
        // Only set user agent if running in node
        if (typeof window === 'undefined') {
            headers["User-Agent"] = 'tastytrade-sdk-js';
        }
        return headers;
    }
    axiosConfig(method, url, data = {}, headers = {}, params = {}) {
        return _.omitBy({ method, url, baseURL: this.baseUrl, data, headers, params, paramsSerializer: ParamsSerializer }, _.isEmpty);
    }
    async generateAccessToken() {
        if (_.isNil(this.refreshToken) || _.isNil(this.clientSecret) || _.isNil(this.oauthScopes)) {
            throw new Error('Missing required parameters to generate access token (refreshToken, clientSecret, oauthScopes)');
        }
        const params = {
            refresh_token: this.refreshToken,
            client_secret: this.clientSecret,
            scope: this.oauthScopes.join(' '),
            grant_type: 'refresh_token'
        };
        const config = this.axiosConfig('post', '/oauth/token', params, this.getDefaultHeaders());
        this.logger?.info('Making request', config);
        const tokenResponse = await axios.request(config);
        this.accessToken.updateFromTokenResponse(tokenResponse);
        return this.accessToken;
    }
    async executeRequest(method, url, data = {}, headers = {}, params = {}) {
        if (this.needsTokenRefresh) {
            await this.generateAccessToken();
        }
        let dasherizedParams = params;
        let dasherizedData = data;
        dasherizedParams = recursiveDasherizeKeys(params);
        dasherizedData = recursiveDasherizeKeys(data);
        const mergedHeaders = { ...headers, ...this.getDefaultHeaders() };
        const config = this.axiosConfig(method, url, dasherizedData, mergedHeaders, dasherizedParams);
        this.logger?.info('Making request', config);
        return axios.request(config);
    }
    async getData(url, headers = {}, queryParams = {}) {
        return this.executeRequest('get', url, {}, headers, queryParams);
    }
    async postData(url, data, headers) {
        return this.executeRequest('post', url, data, headers);
    }
    async putData(url, data, headers) {
        return this.executeRequest('put', url, data, headers);
    }
    async patchData(url, data, headers) {
        return this.executeRequest('patch', url, data, headers);
    }
    async deleteData(url, headers) {
        return this.executeRequest('delete', url, headers);
    }
    get targetApiVersion() {
        return this._targetApiVersion;
    }
    set targetApiVersion(version) {
        if (!_.isNil(version) && !ApiVersionRegex.test(version)) {
            throw new Error('Invalid API version format. Expected YYYYMMDD.');
        }
        this._targetApiVersion = version;
    }
}
//# sourceMappingURL=tastytrade-http-client.js.map