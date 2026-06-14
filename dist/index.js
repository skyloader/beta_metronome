"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const positions_1 = require("./positions");
const funding_1 = require("./funding");
const hedge_1 = require("./hedge");
async function main() {
    console.log('Initializing Tastytrade client...');
    try {
        const client = (0, client_1.createTastytradeClient)();
        console.log('Client created successfully');
        // Test connection
        const isConnected = await (0, client_1.testConnection)(client);
        if (isConnected) {
            console.log('\n=== Connected to Tastytrade API ===\n');
            // Get all accounts
            const accounts = await (0, client_1.getCustomerAccounts)(client);
            console.log('Customer Accounts:');
            accounts.forEach((acc) => {
                const alias = acc.account['nickname'] || acc.account['account-alias'] || 'N/A';
                console.log(`  - ${acc.account['account-number']}: ${alias}`);
            });
            // Get positions for 5WX57665
            console.log('\n--- Testing Positions for 5WX57665 ---');
            try {
                const positions = await (0, positions_1.getCurrentPositions)(client, '5WX57665');
                console.log('Positions retrieved:', positions ? positions.length : 0);
                // Calculate funding size
                console.log('\n--- Calculating Funding Size ---');
                const stockPositions = await (0, funding_1.getStockPositions)(positions);
                console.log('Stock positions:', stockPositions.length);
                // Get live prices (placeholder for now)
                const prices = await (0, funding_1.getLiveStockPrices)(client, positions);
                console.log('Prices map:', Object.entries(prices).slice(0, 3)); // Show first 3
                const fundingSize = await (0, funding_1.calculateFundingSize)(client, '5WX57665', prices);
                console.log(`Funding Size: $${fundingSize.toFixed(2)}`);
                // Calculate QQQ Put hedge
                // Calculate QQQ Put hedge
                console.log('\n--- QQQ Put Hedge Recommendation ---');
                const qqqPrice = await (0, funding_1.getQQQPriceFromPositions)(null, positions);
                const hedgeCount = await (0, hedge_1.calculateHedge)(client, '5WX57665', qqqPrice);
                console.log(`Recommended QQQ Put Options: ${hedgeCount}`);
                const recommendations = await (0, hedge_1.recommendHedgeOptions)(client, '5WX57665', qqqPrice);
                console.log('\nHedge Recommendations:');
                recommendations.forEach((rec) => {
                    console.log(`  - ${rec.symbol}: ${rec.recommendedQuantity} contracts at $${rec.strike} strike (${rec.expiry})`);
                    console.log(`    Reason: ${rec.reason}`);
                });
                const effectiveness = await (0, hedge_1.calculateHedgeEffectiveness)(client, '5WX57665', qqqPrice, 8.50); // Placeholder premium
                console.log(`\nHedge Effectiveness:`);
                console.log(`  - Hedge Ratio: ${effectiveness.hedgeRatio} options`);
                console.log(`  - Estimated Cost: $${effectiveness.cost.toFixed(2)}`);
                console.log(`  - Protection Level: $${effectiveness.protectionLevel.toFixed(0)} of coverage`);
            }
            catch (err) {
                console.log('Positions error:', err.message);
                console.error(err);
            }
        }
        else {
            console.error('Failed to connect to Tastytrade API');
            process.exit(1);
        }
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map