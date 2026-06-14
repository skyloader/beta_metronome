import extractResponseData from "../utils/response-util.js";
export default class RiskParametersService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    //Accounts: Operations about accounts
    async getEffectiveMarginRequirements(accountNumber, underlyingSymbol) {
        //Get effective margin requirements for account
        const effectiveMarginRequirements = (await this.httpClient.getData(`/accounts/${accountNumber}/margin-requirements/${underlyingSymbol}/effective`, {}, {}));
        return extractResponseData(effectiveMarginRequirements);
    }
    async getPositionLimit(accountNumber) {
        //Get the position limit
        const positionLimit = (await this.httpClient.getData(`/accounts/${accountNumber}/position-limit`, {}, {}));
        return extractResponseData(positionLimit);
    }
}
//# sourceMappingURL=risk-parameters-service.js.map