export declare function calculateHedge(client: any, accountNumber: string, qqqPrice: number): Promise<number>;
export declare function getQQQOptionChain(client: any, accountNumber: string): Promise<any[]>;
export declare function recommendHedgeOptions(client: any, accountNumber: string, qqqPrice: number, daysToExpiry?: number): Promise<any[]>;
export declare function calculateHedgeEffectiveness(client: any, accountNumber: string, qqqPrice: number, putPremium: number): Promise<{
    hedgeRatio: number;
    cost: number;
    protectionLevel: number;
}>;
export declare function getPortfolioBeta(client: any, accountNumber: string): Promise<number>;
export declare function calculateBetaAdjustedHedge(client: any, accountNumber: string, qqqPrice: number, portfolioBeta: number): Promise<number>;
declare const _default: {
    calculateHedge: typeof calculateHedge;
    getQQQOptionChain: typeof getQQQOptionChain;
    recommendHedgeOptions: typeof recommendHedgeOptions;
    calculateHedgeEffectiveness: typeof calculateHedgeEffectiveness;
    getPortfolioBeta: typeof getPortfolioBeta;
    calculateBetaAdjustedHedge: typeof calculateBetaAdjustedHedge;
};
export default _default;
//# sourceMappingURL=hedge.d.ts.map