"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("./client");
const positions_1 = require("./positions");
const funding_1 = require("./funding");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
function getClient() {
    return (0, client_1.createTastytradeClient)();
}
app.get('/api/accounts', async (req, res) => {
    try {
        const client = getClient();
        const accounts = await (0, client_1.getCustomerAccounts)(client);
        const result = accounts.map((acc) => ({
            'account-number': acc.account['account-number'],
            'account-alias': acc.account['account-alias'],
            'account-type-name': acc.account['account-type-name'],
            'margin-or-cash': acc.account['margin-or-cash'],
        }));
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ message: 'Failed to fetch accounts', error: error.message });
    }
});
app.get('/api/accounts/:accountNumber/details', async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const client = getClient();
        const positions = await (0, positions_1.getCurrentPositions)(client, accountNumber);
        const qqqPrice = await (0, funding_1.getQQQPriceFromPositions)(null, positions);
        const positionsWithDelta = positions.map((pos) => ({
            ...pos,
            delta: pos['instrument-type'] === 'Equity' ? 1.0 :
                pos['instrument-type'] === 'Equity Option' ? 0.5 : 0
        }));
        // Calculate stock value using close-price from positions
        const stockPositions = positions.filter((p) => p['instrument-type'] === 'Equity');
        const stockValue = stockPositions.reduce((sum, stock) => {
            const quantity = parseFloat(stock['quantity'] || '0');
            const closePrice = parseFloat(stock['close-price'] || '0');
            return sum + quantity * closePrice;
        }, 0);
        // Calculate deep ITM call value
        const deepITMCallPositions = positions.filter((p) => p['instrument-type'] === 'Equity Option' &&
            (0, funding_1.isDeepITMCall)(p, qqqPrice));
        const deepITMCallValue = deepITMCallPositions.reduce((sum, opt) => {
            return sum + (0, funding_1.calculateDeepITMCallValue)(opt, qqqPrice);
        }, 0);
        const fundingSize = stockValue + deepITMCallValue;
        // Calculate detailed funding size breakdown
        const fundingSizeCalculation = {
            stockPositions: stockPositions.map((p) => ({
                symbol: p['symbol'],
                quantity: parseFloat(p['quantity'] || '0'),
                price: parseFloat(p['close-price'] || '0'),
                value: parseFloat(p['quantity'] || '0') * parseFloat(p['close-price'] || '0')
            })),
            deepITMCalls: deepITMCallPositions.map((p) => {
                const symbol = p['symbol'];
                const parts = symbol.split(' ');
                const lastPart = parts[parts.length - 1];
                const strike = lastPart ? parseFloat(lastPart.slice(-7)) / 1000 : 0;
                const quantity = parseFloat(p['quantity'] || '0');
                const value = quantity * 100 * 0.95 * qqqPrice;
                return {
                    symbol,
                    strike,
                    quantity,
                    delta: 0.95,
                    value
                };
            }),
            totalStockValue: stockValue,
            totalDeepITMValue: deepITMCallValue,
            formula: `Funding Size = Σ(stock_qty × stock_price) + Σ(deep_itm_call_qty × 100 × delta × QQQ_price)`
        };
        // Get PUT options with Long direction
        const longPutOptions = positions.filter((p) => p['instrument-type'] === 'Equity Option' &&
            p['underlying-symbol'] === 'QQQ' &&
            p['streamer-symbol']?.includes('P') &&
            p['quantity-direction'] === 'Long');
        const putLongCount = longPutOptions.reduce((sum, p) => sum + parseFloat(p['quantity'] || '0'), 0);
        // Coverage = (PUT Long Count × 100 × QQQ Price) / Funding Size
        const currentHedgePercent = fundingSize > 0 ? (putLongCount * 100 * qqqPrice) / fundingSize * 100 : 0;
        // Hedge ratio = number of PUT contracts needed for full coverage
        const hedgeRatio = Math.ceil(fundingSize / (qqqPrice * 100));
        // Calculate hedge status and recommendation
        let hedgeStatus = 'adequatelyhedged';
        let recommendation = '';
        let formula = '';
        if (currentHedgePercent < 80) {
            hedgeStatus = 'underhedged';
            const neededContracts = Math.max(1, hedgeRatio - putLongCount);
            recommendation = `Buy ${neededContracts} more QQQ PUT options`;
            formula = `Current Hedge: ${putLongCount} contracts Long × 100 × $${qqqPrice.toFixed(2)} / Funding Size $${fundingSize.toFixed(2)} = ${currentHedgePercent.toFixed(1)}% coverage`;
        }
        else if (currentHedgePercent > 120) {
            hedgeStatus = 'overhedged';
            const excessContracts = Math.ceil(putLongCount * (currentHedgePercent - 100) / 100);
            recommendation = `Sell ${excessContracts > 0 ? excessContracts : 1} QQQ PUT options to adjust`;
            formula = `Current Hedge: ${putLongCount} contracts Long × 100 × $${qqqPrice.toFixed(2)} / Funding Size $${fundingSize.toFixed(2)} = ${currentHedgePercent.toFixed(1)}% coverage`;
        }
        else {
            hedgeStatus = 'adequatelyhedged';
            recommendation = 'Current hedge level is appropriate';
            formula = `Current Hedge: ${putLongCount} contracts Long × 100 × $${qqqPrice.toFixed(2)} / Funding Size $${fundingSize.toFixed(2)} = ${currentHedgePercent.toFixed(1)}% coverage`;
        }
        res.json({
            positions: positionsWithDelta,
            fundingSize,
            fundingBreakdown: {
                stockValue,
                deepITMCallValue,
                totalValue: stockValue + deepITMCallValue,
                description: `Stock positions + Deep ITM Call options (quantity × stock price + deep ITM calls × 100 × delta × QQQ price ($${qqqPrice.toFixed(2)}))`
            },
            fundingSizeCalculation,
            hedgeAnalysis: {
                fundingSize,
                qqqPrice,
                hedgeRatio,
                currentHedgeCount: putLongCount,
                coverageRatio: currentHedgePercent,
                status: hedgeStatus,
                recommendation,
                formula,
                estimatedCost: hedgeRatio * 8.5 * 100
            },
            qqqPrice,
            portfolioStats: { stockCount: stockPositions.length, optionCount: positions.length - stockPositions.length, totalValue: fundingSize },
        });
    }
    catch (error) {
        console.error('Error in account details:', error);
        res.status(500).json({ message: 'Failed to fetch account details', error: error.message });
    }
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});
setInterval(() => { }, 1000);
exports.default = app;
//# sourceMappingURL=server.js.map