import { createTastytradeClient, testConnection, getCustomerAccounts, getQuote } from './client';
import { getCurrentPositions } from './positions';
import { calculateFundingSize, getLiveStockPrices, getStockPositions, getQQQPriceFromPositions } from './funding';
import { calculateHedge, recommendHedgeOptions, calculateHedgeEffectiveness } from './hedge';

async function main() {
  console.log('Initializing Tastytrade client...');
  
  try {
    const client = createTastytradeClient();
    console.log('Client created successfully');
    
    // Test connection
    const isConnected = await testConnection(client);
    
    if (isConnected) {
      console.log('\n=== Connected to Tastytrade API ===\n');
      
      // Get all accounts
      const accounts = await getCustomerAccounts(client);
      console.log('Customer Accounts:');
      accounts.forEach((acc: any) => {
        const alias = acc.account['nickname'] || acc.account['account-alias'] || 'N/A';
        console.log(`  - ${acc.account['account-number']}: ${alias}`);
      });
      
      // Get positions for 5WX57665
      console.log('\n--- Testing Positions for 5WX57665 ---');
      try {
        const positions = await getCurrentPositions(client, '5WX57665');
        console.log('Positions retrieved:', positions ? positions.length : 0);
        
        // Calculate funding size
        console.log('\n--- Calculating Funding Size ---');
        const stockPositions = await getStockPositions(positions);
        console.log('Stock positions:', stockPositions.length);
        
        // Get live prices (placeholder for now)
        const prices = await getLiveStockPrices(client, positions);
        console.log('Prices map:', Object.entries(prices).slice(0, 3)); // Show first 3
        
        const fundingSize = await calculateFundingSize(client, '5WX57665', prices);
        console.log(`Funding Size: $${fundingSize.toFixed(2)}`);
        
        // Calculate QQQ Put hedge
        // Calculate QQQ Put hedge
        console.log('\n--- QQQ Put Hedge Recommendation ---');
        const qqqPrice = await getQQQPriceFromPositions(null, positions);
        const hedgeCount = await calculateHedge(client, '5WX57665', qqqPrice);
        console.log(`Recommended QQQ Put Options: ${hedgeCount}`);
        
        const recommendations = await recommendHedgeOptions(client, '5WX57665', qqqPrice);
        console.log('\nHedge Recommendations:');
        recommendations.forEach((rec: any) => {
          console.log(`  - ${rec.symbol}: ${rec.recommendedQuantity} contracts at $${rec.strike} strike (${rec.expiry})`);
          console.log(`    Reason: ${rec.reason}`);
        });
        
        const effectiveness = await calculateHedgeEffectiveness(client, '5WX57665', qqqPrice, 8.50); // Placeholder premium
        console.log(`\nHedge Effectiveness:`);
        console.log(`  - Hedge Ratio: ${effectiveness.hedgeRatio} options`);
        console.log(`  - Estimated Cost: $${effectiveness.cost.toFixed(2)}`);
        console.log(`  - Protection Level: $${effectiveness.protectionLevel.toFixed(0)} of coverage`);
        
      } catch (err) {
        console.log('Positions error:', (err as Error).message);
        console.error(err);
      }
    } else {
      console.error('Failed to connect to Tastytrade API');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
