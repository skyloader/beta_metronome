import TastytradeHttpClient from "./tastytrade-http-client.js";
export default class MarketMetricsService {
    private httpClient;
    constructor(httpClient: TastytradeHttpClient);
    getMarketMetrics(queryParams?: {}): Promise<any>;
    getHistoricalDividendData(symbol: string): Promise<any>;
    getHistoricalEarningsData(symbol: string, queryParams?: {}): Promise<any>;
}
//# sourceMappingURL=market-metrics-service.d.ts.map