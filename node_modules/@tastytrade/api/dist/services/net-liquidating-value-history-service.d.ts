import TastytradeHttpClient from "./tastytrade-http-client.js";
export default class NetLiquidatingValueHistoryService {
    private httpClient;
    constructor(httpClient: TastytradeHttpClient);
    getNetLiquidatingValueHistory(accountNumber: string, queryParams?: {}): Promise<any>;
    getNetLiquidatingValue(accountNumber: string): Promise<any>;
}
//# sourceMappingURL=net-liquidating-value-history-service.d.ts.map