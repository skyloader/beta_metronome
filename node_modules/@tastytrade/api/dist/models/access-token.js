import _ from 'lodash';
export default class AccessToken {
    constructor() {
        this.token = '';
        this.expiresIn = 0;
        this.createdAt = null;
    }
    get isExpired() {
        return this.isEmpty || Date.now() >= this.expiration.getTime();
    }
    get isValid() {
        return !_.isNil(this.token) && !this.isExpired;
    }
    get isEmpty() {
        return _.isNil(this.token) || this.token.length === 0;
    }
    get expiration() {
        if (!this.createdAt)
            return new Date();
        // Set expiration a bit earlier to account for clock skew
        return new Date(this.createdAt.getTime() + ((this.expiresIn - 30) * 1000));
    }
    updateFromTokenResponse(tokenResponse) {
        this.token = _.get(tokenResponse, "data.access_token");
        this.expiresIn = _.get(tokenResponse, "data.expires_in");
        this.createdAt = new Date();
    }
    get authorizationHeader() {
        if (this.isValid) {
            return `Bearer ${this.token}`;
        }
        return null;
    }
    clear() {
        this.token = '';
        this.expiresIn = 0;
        this.createdAt = null;
    }
}
//# sourceMappingURL=access-token.js.map