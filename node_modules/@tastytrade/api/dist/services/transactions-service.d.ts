import TastytradeHttpClient from "./tastytrade-http-client.js";
export default class TransactionsService {
    private httpClient;
    constructor(httpClient: TastytradeHttpClient);
    getTransaction(accountNumber: string, id: string): Promise<any>;
    getTotalFees(accountNumber: string): Promise<any>;
    getAccountTransactions(accountNumber: string, queryParams?: {}): Promise<any>;
}
//# sourceMappingURL=transactions-service.d.ts.map