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
const hedge_1 = require("./hedge");
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
        const hedgeCount = await (0, hedge_1.calculateHedge)(client, accountNumber, qqqPrice);
        const recommendations = await (0, hedge_1.recommendHedgeOptions)(client, accountNumber, qqqPrice);
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
        // Build detailed calculation breakdown
        const calculationDetails = {
            stockPositions: stockPositions.map((p) => ({
                symbol: p['symbol'],
                quantity: parseFloat(p['quantity'] || '0'),
                closePrice: parseFloat(p['close-price'] || '0'),
                value: parseFloat(p['quantity'] || '0') * parseFloat(p['close-price'] || '0')
            })),
            deepITMCalls: deepITMCallPositions.map((p) => {
                const symbol = p['symbol'];
                const parts = symbol.split(' ');
                const lastPart = parts[parts.length - 1];
                const strike = lastPart ? parseFloat(lastPart.slice(-7)) / 1000 : 0;
                const quantity = parseFloat(p['quantity'] || '0');
                // Value = quantity × 100 × delta × stock_price
                const value = quantity * 100 * 0.95 * qqqPrice;
                return {
                    symbol,
                    strike,
                    quantity,
                    delta: 0.95,
                    value
                };
            }),
            qqqPrice,
            deepITMThreshold: qqqPrice * 0.9
        };
        res.json({
            positions: positionsWithDelta,
            fundingSize: stockValue + deepITMCallValue,
            fundingBreakdown: {
                stockValue,
                deepITMCallValue,
                totalValue: stockValue + deepITMCallValue,
                description: `Stock positions + Deep ITM Call options (quantity × stock price + deep ITM calls × 100 × delta × QQQ price ($${qqqPrice.toFixed(2)}))`
            },
            calculationDetails,
            hedgeRecommendations: recommendations,
            qqqPrice,
            portfolioStats: { stockCount: stockPositions.length, optionCount: positions.length - stockPositions.length, totalValue: stockValue + deepITMCallValue },
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