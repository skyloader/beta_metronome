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
    
    const fundingSize = stockValue + deepITMCallValue;
    
    // Get PUT options with Long direction
    const longPutOptions = positions.filter((p: any) => 
      p['instrument-type'] === 'Equity Option' && 
      p['underlying-symbol'] === 'QQQ' &&
      p['streamer-symbol']?.includes('P') &&
      p['quantity-direction'] === 'Long'
    );
    
    const putLongCount = longPutOptions.reduce((sum: number, p: any) => 
      sum + parseFloat(p['quantity'] || '0'), 0);
    
    // Coverage = (PUT Long Count × 100 × QQQ Price) / Funding Size
    // A coverage ratio > 1 means adequate protection
    const currentHedgePercent = fundingSize > 0 ? (putLongCount * 100 * qqqPrice) / fundingSize * 100 : 0;
    
    // Calculate hedge ratio = number of PUT contracts needed for full coverage
    const hedgeRatio = Math.ceil(fundingSize / (qqqPrice * 100));
    
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
    
    // Calculate hedge status and recommendation
    let hedgeStatus: 'underhedged' | 'adequatelyhedged' | 'overhedged' = 'adequatelyhedged';
    let recommendation: string = '';
    let formula: string = '';
    
    if (currentHedgePercent < 80) {
      hedgeStatus = 'underhedged';
      const neededContracts = Math.max(1, hedgeRatio - putLongCount);
      recommendation = `Buy ${neededContracts} more QQQ PUT options`;
      formula = `Current Hedge: ${putLongCount} contracts Long × 100 × $${qqqPrice.toFixed(2)} / Funding Size $${fundingSize.toFixed(2)} = ${currentHedgePercent.toFixed(1)}% coverage`;
    } else if (currentHedgePercent > 120) {
      hedgeStatus = 'overhedged';
      const excessContracts = Math.ceil(putLongCount * (currentHedgePercent - 100) / 100);
      recommendation = `Sell ${excessContracts > 0 ? excessContracts : 1} QQQ PUT options to adjust`;
      formula = `Current Hedge: ${putLongCount} contracts Long × 100 × $${qqqPrice.toFixed(2)} / Funding Size $${fundingSize.toFixed(2)} = ${currentHedgePercent.toFixed(1)}% coverage`;
    } else {
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
      calculationDetails,
      hedgeRecommendations: recommendations,
      qqqPrice,
      portfolioStats: { stockCount: stockPositions.length, optionCount: positions.length - stockPositions.length, totalValue: fundingSize },
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
