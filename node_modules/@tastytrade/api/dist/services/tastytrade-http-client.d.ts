import AccessToken from "../models/access-token.js";
import type Logger from "../logger.js";
import type { ClientConfig } from "../tastytrade-api.js";
export default class TastytradeHttpClient {
    private readonly logger?;
    baseUrl: string;
    clientSecret: string;
    refreshToken: string;
    oauthScopes: string[];
    readonly accessToken: AccessToken;
    private _targetApiVersion?;
    constructor(clientConfig: ClientConfig, logger?: Logger);
    updateConfig(config: Partial<ClientConfig>): void;
    get needsTokenRefresh(): boolean;
    get authHeader(): string | null;
    private getDefaultHeaders;
    private axiosConfig;
    generateAccessToken(): Promise<any>;
    private executeRequest;
    getData(url: string, headers?: object, queryParams?: object): Promise<any>;
    postData(url: string, data: object, headers: object): Promise<any>;
    putData(url: string, data: object, headers: object): Promise<any>;
    patchData(url: string, data: object, headers: object): Promise<any>;
    deleteData(url: string, headers: object): Promise<any>;
    get targetApiVersion(): string | undefined;
    set targetApiVersion(version: string | undefined);
}
//# sourceMappingURL=tastytrade-http-client.d.ts.map