import TastytradeHttpClient from "./tastytrade-http-client.js";
export default class BalancesAndPositionsService {
    private httpClient;
    constructor(httpClient: TastytradeHttpClient);
    getPositionsList(accountNumber: string, queryParams?: {}): Promise<any>;
    getAccountBalanceValues(accountNumber: string): Promise<any>;
    getBalanceSnapshots(accountNumber: string, queryParams?: {}): Promise<any>;
}
//# sourceMappingURL=balances-and-positions-service.d.ts.map