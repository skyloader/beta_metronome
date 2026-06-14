import extractResponseData from "../utils/response-util.js";
export default class NetLiquidatingValueHistoryService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    //Default
    async getNetLiquidatingValueHistory(accountNumber, queryParams = {}) {
        //Returns a list of account net liquidating value snapshots.
        const netLiquidatingValueHistory = (await this.httpClient.getData(`/accounts/${accountNumber}/net-liq/history`, {}, queryParams));
        return extractResponseData(netLiquidatingValueHistory);
    }
    async getNetLiquidatingValue(accountNumber) {
        //Returns a list of account net liquidating value snapshots.
        const netLiquidatingValue = await this.httpClient.getData(`/accounts/${accountNumber}/net-liq`);
        return extractResponseData(netLiquidatingValue);
    }
}
//# sourceMappingURL=net-liquidating-value-history-service.js.map