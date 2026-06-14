import express, { Request, Response } from 'express';
import cors from 'cors';
import { createTastytradeClient, getCustomerAccounts } from './client';
import { getCurrentPositions } from './positions';
import { calculateFundingSize, getStockPositions, getQQQPriceFromPositions, isDeepITMCall, calculateDeepITMCallValue } from './funding';
import { calculateHedge, recommendHedgeOptions } from './hedge';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function getClient() {
  return createTastytradeClient();
}

app.get('/api/accounts', async (req: Request, res: Response) => {
  try {
    const client = getClient();
    const accounts = await getCustomerAccounts(client);
    const result = accounts.map((acc: any) => ({
      'account-number': acc.account['account-number'],
      'account-alias': acc.account['account-alias'],
      'account-type-name': acc.account['account-type-name'],
      'margin-or-cash': acc.account['margin-or-cash'],
    }));
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ message: 'Failed to fetch accounts', error: error.message });
  }
});

app.get('/api/accounts/:accountNumber/details', async (req: Request, res: Response) => {
  try {
    const { accountNumber } = req.params;
    const client = getClient();
    
    const positions = await getCurrentPositions(client, accountNumber as string);
    const qqqPrice = await getQQQPriceFromPositions(null, positions);
    
    const positionsWithDelta = positions.map((pos: any) => ({
      ...pos,
      delta: pos['instrument-type'] === 'Equity' ? 1.0 :
             pos['instrument-type'] === 'Equity Option' ? 0.5 : 0
    }));
    
    const hedgeCount = await calculateHedge(client, accountNumber as string, qqqPrice);
    const recommendations = await recommendHedgeOptions(client, accountNumber as string, qqqPrice);
    
    // Calculate stock value using close-price from positions
    const stockPositions = positions.filter((p: any) => p['instrument-type'] === 'Equity');
    
    const stockValue = stockPositions.reduce((sum: number, stock: any) => {
      const quantity = parseFloat(stock['quantity'] || '0');
      const closePrice = parseFloat(stock['close-price'] || '0');
      return sum + quantity * closePrice;
    }, 0);
    
    // Calculate deep ITM call value
    const deepITMCallPositions = positions.filter((p: any) => 
      p['instrument-type'] === 'Equity Option' && 
      isDeepITMCall(p, qqqPrice)
    );
    const deepITMCallValue = deepITMCallPositions.reduce((sum: number, opt: any) => {
      return sum + calculateDeepITMCallValue(opt, qqqPrice);
    }, 0);
    
    // Build detailed calculation breakdown
    const calculationDetails = {
      stockPositions: stockPositions.map((p: any) => ({
        symbol: p['symbol'],
        quantity: parseFloat(p['quantity'] || '0'),
        closePrice: parseFloat(p['close-price'] || '0'),
        value: parseFloat(p['quantity'] || '0') * parseFloat(p['close-price'] || '0')
      })),
      deepITMCalls: deepITMCallPositions.map((p: any) => {
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
  } catch (error: any) {
    console.error('Error in account details:', error);
    res.status(500).json({ message: 'Failed to fetch account details', error: error.message });
  }
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

setInterval(() => {}, 1000);
export default app;
