import extractResponseData from "../utils/response-util.js";
// create the central class that aggregates all services
export default class AccountStatusService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    //Trading Status: Allows an API client to request information about the basic trade status of an account. This includes information about the strategies an account can trade. 
    async getAccountStatus(accountNumber) {
        //Returns current trading status for an account.
        const accountStatus = (await this.httpClient.getData(`/accounts/${accountNumber}/trading-status`, {}, {}));
        return extractResponseData(accountStatus);
    }
}
//# sourceMappingURL=account-status-service.js.map