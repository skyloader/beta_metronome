import extractResponseData from "../utils/response-util.js";
export default class MarketMetricsService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    //Default
    async getMarketMetrics(queryParams = {}) {
        //Returns an array of volatility data for given symbols.
        const marketMetrics = (await this.httpClient.getData('/market-metrics', {}, queryParams));
        return extractResponseData(marketMetrics);
    }
    async getHistoricalDividendData(symbol) {
        //Get historical dividend data
        const historicalDividendData = (await this.httpClient.getData(`/market-metrics/historic-corporate-events/dividends/${symbol}`, {}, {}));
        return extractResponseData(historicalDividendData);
    }
    async getHistoricalEarningsData(symbol, queryParams = {}) {
        //Get historical earnings data
        const historicalEarningsData = (await this.httpClient.getData(`/market-metrics/historic-corporate-events/earnings-reports/${symbol}`, {}, queryParams));
        return extractResponseData(historicalEarningsData);
    }
}
//# sourceMappingURL=market-metrics-service.js.map