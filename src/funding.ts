import TastytradeClient from '@tastytrade/api';
import * as fs from 'fs';
import { getCurrentPositions } from './positions';
import { getQuote as clientGetQuote } from './client';

// Types
interface Position {
  'instrument-type': string;
  'quantity-direction'?: string;
  'streamer-symbol'?: string;
  symbol: string;
  'underlying-symbol'?: string;
  quantity?: string | number;
  'close-price'?: string;
}

// Parse strike price from Tastytrade symbol (format: "QQQ   260618C00743000")
function parseStrike(symbol: string): number {
  const parts = symbol.split(' ');
  if (parts.length === 0) return 0;
  
  const lastPart = parts[parts.length - 1];
  if (!lastPart || lastPart.length < 7) return 0;
  
  // Extract 7-digit strike code (e.g., 00743000 -> 743.00)
  const strikeCode = lastPart.slice(-7);
  return parseFloat(strikeCode) / 1000;
}

// Get current stock positions
export async function getStockPositions(positions: Position[]): Promise<Position[]> {
  return positions.filter(
    (p) => p['instrument-type'] === 'Equity' && p['quantity-direction'] !== 'Combined'
  );
}

// Get option positions
export async function getOptionPositions(positions: Position[]): Promise<Position[]> {
  return positions.filter((p) => p['instrument-type'] === 'Equity Option');
}

// Check if an option is Deep ITM Call
export function isDeepITMCall(option: Position, stockPrice: number): boolean {
  if (option['instrument-type'] !== 'Equity Option') return false;
  if (option['quantity-direction'] !== 'Long' && option['quantity-direction'] !== 'Short') return false;
  if (!option['streamer-symbol']?.includes('C')) return false;

  const strikePrice = parseStrike(option.symbol);
  return strikePrice < stockPrice * 0.9;
}

// Estimate option delta based on ITM/OTM status
export function estimateOptionDelta(option: Position, stockPrice: number): number {
  const strikePrice = parseStrike(option.symbol);
  
  if (!strikePrice || !stockPrice) return 0.5;
  
  const optionType = option['streamer-symbol']?.includes('C') ? 'Call' : 'Put';
  const isITM = optionType === 'Call' ? strikePrice < stockPrice : strikePrice > stockPrice;
  
  if (!isITM) return 0.3;
  
  const moneyness = Math.abs(strikePrice - stockPrice) / stockPrice;
  if (moneyness < 0.1) return 0.8;
  if (moneyness < 0.2) return 0.7;
  return 0.95;
}

// Calculate stock position value
export function calculateStockPositionValue(position: Position, stockPrice: number): number {
  const quantity = parseFloat(position.quantity?.toString() || '0');
  return quantity * stockPrice;
}

// Calculate Deep ITM Call value
export function calculateDeepITMCallValue(option: Position, stockPrice: number): number {
  const quantity = parseFloat(option.quantity?.toString() || '0');
  // Deep ITM call delta is approximately 0.95
  // Value = quantity × 100 × delta × stock_price
  return quantity * 100 * 0.95 * stockPrice;
}

// Calculate funding size
// Sum of all stock's ( (stock number * stock price) + Number of Stock's Deep ITM Call * 100 * Stock's Deep ITM Call's Delta value )
export async function calculateFundingSize(
  client: TastytradeClient,
  accountNumber: string,
  stockPriceMap: Record<string, number>
): Promise<number> {
  const positions = await getCurrentPositions(client, accountNumber);
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
export async function getLiveStockPrices(client: TastytradeClient, positions: Position[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  
  for (const pos of positions) {
    if (pos['instrument-type'] === 'Equity') {
      // Use close-price from position data for stocks
      const closePrice = parseFloat(pos['close-price'] || '0');
      if (closePrice > 0) {
        prices[pos.symbol] = closePrice;
      }
    } else if (pos['instrument-type'] === 'Equity Option') {
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
export function getQQQPriceFromPositions(positions: Position[]): number {
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

export default {
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
