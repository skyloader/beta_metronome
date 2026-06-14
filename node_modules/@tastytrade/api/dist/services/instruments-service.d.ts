import TastytradeHttpClient from "./tastytrade-http-client.js";
export default class InstrumentsService {
    private httpClient;
    constructor(httpClient: TastytradeHttpClient);
    getCryptocurrencies(symbols?: string[]): Promise<any>;
    getSingleCryptocurrency(symbol: string): Promise<any>;
    getActiveEquities(queryParams?: {}): Promise<any>;
    getEquityDefinitions(queryParams?: {}): Promise<any>;
    getSingleEquity(symbol: string): Promise<any>;
    getEquityOptions(symbols: string[], active?: boolean, withExpired?: boolean): Promise<any>;
    getSingleEquityOption(symbol: string, queryParams?: {}): Promise<any>;
    getFutures(queryParams?: {}): Promise<any>;
    getSingleFuture(symbol: string): Promise<any>;
    getFutureOptionsProducts(): Promise<any>;
    getSingleFutureOptionProduct(exchange: string, rootSymbol: string): Promise<any>;
    getFutureOptions(queryParams?: {}): Promise<any>;
    getSingleFutureOption(symbol: string): Promise<any>;
    getFuturesProducts(): Promise<any>;
    getSingleFutureProduct(exchange: string, code: string): Promise<any>;
    getQuantityDecimalPrecisions(): Promise<any>;
    getWarrants(queryParams?: {}): Promise<any>;
    getSingleWarrant(symbol: string): Promise<any>;
    getNestedFutureOptionChains(symbol: string): Promise<any>;
    getFutureOptionChain(symbol: string): Promise<any>;
    getNestedOptionChain(symbol: string): Promise<any>;
    getCompactOptionChain(symbol: string): Promise<any>;
    getOptionChain(symbol: string): Promise<any>;
}
//# sourceMappingURL=instruments-service.d.ts.map