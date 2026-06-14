import _ from 'lodash';
export default class TastytradeSession {
    constructor() {
        this.authToken = null;
    }
    get isValid() {
        return !_.isNil(this.authToken);
    }
    clear() {
        this.authToken = null;
    }
}
//# sourceMappingURL=tastytrade-session.js.map