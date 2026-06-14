import TastytradeHttpClient from "./tastytrade-http-client.js";
export default class OrderService {
    private httpClient;
    constructor(httpClient: TastytradeHttpClient);
    postReconfirmOrder(accountNumber: string, orderId: number): Promise<any>;
    replacementOrderDryRun(accountNumber: string, orderId: number, replacementOrder: object): Promise<any>;
    getOrder(accountNumber: string, orderId: number): Promise<any>;
    cancelOrder(accountNumber: string, orderId: number): Promise<any>;
    cancelComplexOrder(accountNumber: string, orderId: number): Promise<any>;
    replaceOrder(accountNumber: string, orderId: number, replacementOrder: object): Promise<any>;
    editOrder(accountNumber: string, orderId: number, order: object): Promise<any>;
    getLiveOrders(accountNumber: string): Promise<any>;
    getOrders(accountNumber: string, queryParams?: {}): Promise<any>;
    createOrder(accountNumber: string, order: object): Promise<any>;
    createComplexOrder(accountNumber: string, order: object): Promise<any>;
    postOrderDryRun(accountNumber: string, order: object): Promise<any>;
    getLiveOrdersForCustomer(customerId: string): Promise<any>;
    getCustomerOrders(customerId: string, queryParams?: {}): Promise<any>;
}
//# sourceMappingURL=orders-service.d.ts.map