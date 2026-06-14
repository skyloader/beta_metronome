import TastytradeHttpClient from "./tastytrade-http-client.js";
export default class SymbolSearchService {
    private httpClient;
    constructor(httpClient: TastytradeHttpClient);
    getSymbolData(symbol: string): Promise<any>;
}
//# sourceMappingURL=symbol-search-service.d.ts.map