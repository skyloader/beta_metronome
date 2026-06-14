import TastytradeClient from '@tastytrade/api';
interface Position {
    'instrument-type': string;
    'quantity-direction'?: string;
    'streamer-symbol'?: string;
    symbol: string;
    'underlying-symbol'?: string;
    quantity?: string | number;
    'close-price'?: string;
}
declare function parseStrike(symbol: string): number;
export declare function getStockPositions(positions: Position[]): Promise<Position[]>;
export declare function getOptionPositions(positions: Position[]): Promise<Position[]>;
export declare function isDeepITMCall(option: Position, stockPrice: number): boolean;
export declare function estimateOptionDelta(option: Position, stockPrice: number): number;
export declare function calculateStockPositionValue(position: Position, stockPrice: number): number;
export declare function calculateDeepITMCallValue(option: Position, stockPrice: number): number;
export declare function calculateFundingSize(client: TastytradeClient, accountNumber: string, stockPriceMap: Record<string, number>): Promise<number>;
export declare function getLiveStockPrices(client: TastytradeClient, positions: Position[]): Promise<Record<string, number>>;
export declare function getQQQPriceFromPositions(positions: Position[]): number;
declare const _default: {
    getStockPositions: typeof getStockPositions;
    getOptionPositions: typeof getOptionPositions;
    isDeepITMCall: typeof isDeepITMCall;
    estimateOptionDelta: typeof estimateOptionDelta;
    calculateStockPositionValue: typeof calculateStockPositionValue;
    calculateDeepITMCallValue: typeof calculateDeepITMCallValue;
    calculateFundingSize: typeof calculateFundingSize;
    getLiveStockPrices: typeof getLiveStockPrices;
    getQQQPriceFromPositions: typeof getQQQPriceFromPositions;
    parseStrike: typeof parseStrike;
};
export default _default;
//# sourceMappingURL=funding.d.ts.map