import TastytradeHttpClient from "./tastytrade-http-client.js";
export default class MarginRequirementsService {
    private httpClient;
    constructor(httpClient: TastytradeHttpClient);
    getMarginRequirements(accountNumber: string): Promise<any>;
    postMarginRequirements(accountNumber: string, order: object): Promise<any>;
}
//# sourceMappingURL=margin-requirements-service.d.ts.map