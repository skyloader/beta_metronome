import TastytradeClient from '@tastytrade/api';
import { getCurrentPositions } from './positions';
import { calculateFundingSize, getLiveStockPrices, getStockPositions, getOptionPositions } from './funding';
import { getQuote } from './client';
// Calculate hedge ratio based on funding size and QQQ price
export async function calculateHedge(client: any, accountNumber: string, qqqPrice: number): Promise<number> {
  // Get current funding size
  const prices = await getLiveStockPrices(client, await getCurrentPositions(client, accountNumber));
  const fundingSize = await calculateFundingSize(client, accountNumber, prices);
  
  // Calculate number of QQQ Put options needed
  // Each option controls 100 shares
  // Hedge ratio: funding size / (QQQ price * 100)
  // Round up to ensure adequate coverage
  const hedgeRatio = fundingSize / (qqqPrice * 100);
  
  return Math.ceil(hedgeRatio);
}

// Get QQQ option chain
export async function getQQQOptionChain(client: any, accountNumber: string): Promise<any[]> {
  // For now, return a placeholder
  // In production, this would query the Tastytrade options chain API
  return [];
}

// Recommend QQQ Put options for hedging
export async function recommendHedgeOptions(client: any, accountNumber: string, qqqPrice: number, daysToExpiry: number = 30): Promise<any[]> {
  const hedgeCount = await calculateHedge(client, accountNumber, qqqPrice);
  
  // Calculate strike price (ATM or slightly OTM)
  const strikePrice = Math.round(qqqPrice * 0.98); // 2% OTM
  
  // Generate recommended options
  const options = [];
  
  // Recommend multiple expiry dates
  const expiryDates = [
    new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date(Date.now() + (daysToExpiry + 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date(Date.now() + (daysToExpiry + 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  ];
  
  for (const expiry of expiryDates) {
    options.push({
      symbol: `QQQ ${expiry.slice(2)}P${Math.round(strikePrice * 100).toString().padStart(6, '0')}`,
      strike: strikePrice,
      expiry: expiry,
      recommendedQuantity: Math.ceil(hedgeCount / 3), // Spread across expiries
      reason: `Hedge ${Math.round((hedgeCount / 3) * 100)} shares of QQQ exposure`
    });
  }
  
  return options;
}

// Calculate hedge effectiveness
export async function calculateHedgeEffectiveness(client: any, accountNumber: string, qqqPrice: number, putPremium: number): Promise<{ hedgeRatio: number; cost: number; protectionLevel: number }> {
  const hedgeCount = await calculateHedge(client, accountNumber, qqqPrice);
  
  // Cost = number of options * premium * 100
  const cost = hedgeCount * putPremium * 100;
  
  // Protection level = hedge ratio * 100%
  const protectionLevel = hedgeCount * 100;
  
  return {
    hedgeRatio: hedgeCount,
    cost: cost,
    protectionLevel: protectionLevel
  };
}

// Get current portfolio beta (simplified)
export async function getPortfolioBeta(client: any, accountNumber: string): Promise<number> {
  // Placeholder - would need to calculate from actual positions
  // For now, assume beta of 1.0 (matches QQQ)
  return 1.0;
}

// Calculate beta-adjusted hedge
export async function calculateBetaAdjustedHedge(client: any, accountNumber: string, qqqPrice: number, portfolioBeta: number): Promise<number> {
  const baseHedge = await calculateHedge(client, accountNumber, qqqPrice);
  return Math.round(baseHedge * portfolioBeta);
}

export default {
  calculateHedge,
  getQQQOptionChain,
  recommendHedgeOptions,
  calculateHedgeEffectiveness,
  getPortfolioBeta,
  calculateBetaAdjustedHedge
};
