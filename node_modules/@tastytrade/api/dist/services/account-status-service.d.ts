import TastytradeHttpClient from "./tastytrade-http-client.js";
export default class AccountStatusService {
    private httpClient;
    constructor(httpClient: TastytradeHttpClient);
    getAccountStatus(accountNumber: string): Promise<any>;
}
//# sourceMappingURL=account-status-service.d.ts.map