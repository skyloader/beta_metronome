import TastytradeHttpClient from "./tastytrade-http-client.js";
export default class AccountsAndCustomersService {
    private httpClient;
    constructor(httpClient: TastytradeHttpClient);
    getCustomerAccounts(): Promise<any>;
    getCustomerResource(): Promise<any>;
    getCustomerAccountResources(): Promise<any>;
    getFullCustomerAccountResource(accountNumber: string): Promise<any>;
    getApiQuoteToken(): Promise<any>;
}
//# sourceMappingURL=accounts-and-customers-service.d.ts.map