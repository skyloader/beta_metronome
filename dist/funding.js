"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockPositions = getStockPositions;
exports.getOptionPositions = getOptionPositions;
exports.isDeepITMCall = isDeepITMCall;
exports.estimateOptionDelta = estimateOptionDelta;
exports.calculateStockPositionValue = calculateStockPositionValue;
exports.calculateDeepITMCallValue = calculateDeepITMCallValue;
exports.calculateFundingSize = calculateFundingSize;
exports.getLiveStockPrices = getLiveStockPrices;
exports.getQQQPriceFromPositions = getQQQPriceFromPositions;
const positions_1 = require("./positions");
// Parse strike price from Tastytrade symbol (format: "QQQ   260618C00743000")
function parseStrike(symbol) {
    const parts = symbol.split(' ');
    if (parts.length === 0)
        return 0;
    const lastPart = parts[parts.length - 1];
    if (!lastPart || lastPart.length < 7)
        return 0;
    // Extract 7-digit strike code (e.g., 00743000 -> 743.00)
    const strikeCode = lastPart.slice(-7);
    return parseFloat(strikeCode) / 1000;
}
// Get current stock positions
async function getStockPositions(positions) {
    return positions.filter((p) => p['instrument-type'] === 'Equity' && p['quantity-direction'] !== 'Combined');
}
// Get option positions
async function getOptionPositions(positions) {
    return positions.filter((p) => p['instrument-type'] === 'Equity Option');
}
// Check if an option is Deep ITM Call
function isDeepITMCall(option, stockPrice) {
    if (option['instrument-type'] !== 'Equity Option')
        return false;
    if (option['quantity-direction'] !== 'Long' && option['quantity-direction'] !== 'Short')
        return false;
    if (!option['streamer-symbol']?.includes('C'))
        return false;
    const strikePrice = parseStrike(option.symbol);
    return strikePrice < stockPrice * 0.9;
}
// Estimate option delta based on ITM/OTM status
function estimateOptionDelta(option, stockPrice) {
    const strikePrice = parseStrike(option.symbol);
    if (!strikePrice || !stockPrice)
        return 0.5;
    const optionType = option['streamer-symbol']?.includes('C') ? 'Call' : 'Put';
    const isITM = optionType === 'Call' ? strikePrice < stockPrice : strikePrice > stockPrice;
    if (!isITM)
        return 0.3;
    const moneyness = Math.abs(strikePrice - stockPrice) / stockPrice;
    if (moneyness < 0.1)
        return 0.8;
    if (moneyness < 0.2)
        return 0.7;
    return 0.95;
}
// Calculate stock position value
function calculateStockPositionValue(position, stockPrice) {
    const quantity = parseFloat(position.quantity?.toString() || '0');
    return quantity * stockPrice;
}
// Calculate Deep ITM Call value
function calculateDeepITMCallValue(option, stockPrice) {
    const quantity = parseFloat(option.quantity?.toString() || '0');
    // Deep ITM call delta is approximately 0.95
    // Value = quantity × 100 × delta × stock_price
    return quantity * 100 * 0.95 * stockPrice;
}
// Calculate funding size
// Sum of all stock's ( (stock number * stock price) + Number of Stock's Deep ITM Call * 100 * Stock's Deep ITM Call's Delta value )
async function calculateFundingSize(client, accountNumber, stockPriceMap) {
    const positions = await (0, positions_1.getCurrentPositions)(client, accountNumber);
    const stockPositions = await getStockPositions(positions);
    let totalFundingSize = 0;
    for (const stock of stockPositions) {
        const symbol = stock.symbol;
        const quantity = parseFloat(stock.quantity?.toString() || '0');
        const price = stockPriceMap[symbol] ?? 0;
        totalFundingSize += quantity * price;
        // Check for Deep ITM Calls on this stock
        for (const option of positions.filter((p) => p['instrument-type'] === 'Equity Option')) {
            if (option['underlying-symbol'] === symbol && isDeepITMCall(option, price)) {
                totalFundingSize += calculateDeepITMCallValue(option, price);
            }
        }
    }
    return totalFundingSize;
}
// Get live stock prices from positions (using close-price from positions data)
async function getLiveStockPrices(client, positions) {
    const prices = {};
    for (const pos of positions) {
        if (pos['instrument-type'] === 'Equity') {
            // Use close-price from position data for stocks
            const closePrice = parseFloat(pos['close-price'] || '0');
            if (closePrice > 0) {
                prices[pos.symbol] = closePrice;
            }
        }
        else if (pos['instrument-type'] === 'Equity Option') {
            // For options, extract stock price from strike
            const underlying = pos['underlying-symbol'];
            if (underlying && !prices[underlying]) {
                // Use strike price as proxy for stock price
                const strike = parseStrike(pos.symbol);
                if (strike > 0) {
                    prices[underlying] = strike;
                }
            }
        }
    }
    return prices;
}
// Get QQQ price from positions (using QQQ option close prices)
function getQQQPriceFromPositions(positions) {
    // Find QQQ option and extract price from symbol
    for (const pos of positions) {
        if (pos.symbol.includes('QQQ') && pos['instrument-type'] === 'Equity Option') {
            const strike = parseStrike(pos.symbol);
            if (strike > 0 && strike < 1000) {
                return strike;
            }
        }
    }
    return 395.5; // Default fallback
}
exports.default = {
    getStockPositions,
    getOptionPositions,
    isDeepITMCall,
    estimateOptionDelta,
    calculateStockPositionValue,
    calculateDeepITMCallValue,
    calculateFundingSize,
    getLiveStockPrices,
    getQQQPriceFromPositions,
    parseStrike,
};
//# sourceMappingURL=funding.js.map