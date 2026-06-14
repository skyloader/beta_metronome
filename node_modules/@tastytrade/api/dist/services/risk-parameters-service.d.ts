import TastytradeHttpClient from "./tastytrade-http-client.js";
export default class RiskParametersService {
    private httpClient;
    constructor(httpClient: TastytradeHttpClient);
    getEffectiveMarginRequirements(accountNumber: string, underlyingSymbol: string): Promise<any>;
    getPositionLimit(accountNumber: string): Promise<any>;
}
//# sourceMappingURL=risk-parameters-service.d.ts.map