import TastytradeClient from '@tastytrade/api';
export declare function createTastytradeClient(): TastytradeClient;
export declare function getCustomerAccounts(client: any): Promise<any[]>;
export declare function getAccountByNumber(client: any, accountNumber: string): Promise<any>;
export declare function testConnection(client: any): Promise<boolean>;
export declare function getQuote(client: any, symbol: string): Promise<number | null>;
declare const _default: {
    createTastytradeClient: typeof createTastytradeClient;
    getCustomerAccounts: typeof getCustomerAccounts;
    getAccountByNumber: typeof getAccountByNumber;
    testConnection: typeof testConnection;
};
export default _default;
//# sourceMappingURL=client.d.ts.map