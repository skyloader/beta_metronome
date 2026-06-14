import TastytradeClient from '@tastytrade/api';
import * as fs from 'fs';
import * as path from 'path';

// Load token info from token.info file
function loadTokenInfo(): { client_id: string; client_secret: string; refresh_token: string } {
  const tokenPath = path.join(__dirname, '..', 'token.info');
  const content = fs.readFileSync(tokenPath, 'utf8');
  
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const tokenInfo: { [key: string]: string } = {};
  
  for (const line of lines) {
    const [key, value] = line.split(': ').map(s => s.trim());
    if (key && value) {
      tokenInfo[key.toLowerCase()] = value;
    }
  }
  
  return {
    client_id: tokenInfo['client_id'] || '',
    client_secret: tokenInfo['client_secret'] || '',
    refresh_token: tokenInfo['refresh_token'] || ''
  };
}

// Initialize Tastytrade client with OAuth authentication
export function createTastytradeClient() {
  const { client_secret, refresh_token } = loadTokenInfo();
  
  if (!client_secret || !refresh_token) {
    throw new Error('Missing required credentials in token.info');
  }

  const client = new TastytradeClient({
    baseUrl: 'https://api.tastyworks.com',
    accountStreamerUrl: 'wss://streamer.tastyworks.com',
    clientSecret: client_secret,
    refreshToken: refresh_token,
    oauthScopes: ['read', 'trade']
  });

  return client;
}

// Get all customer accounts
export async function getCustomerAccounts(client: any): Promise<any[]> {
  const response = await client.accountsAndCustomersService.getCustomerAccounts();
  
  // Log response structure for debugging
  console.log('Full response:', JSON.stringify(response, null, 2));
  
  // Response is array directly, not response.items
  return Array.isArray(response) ? response : response.items || [];
}

// Get account by number
export async function getAccountByNumber(client: any, accountNumber: string): Promise<any> {
  const accounts = await getCustomerAccounts(client);
  return accounts.find((acc: any) => acc.account['account-number'] === accountNumber);
}

// Test client connection
export async function testConnection(client: any): Promise<boolean> {
  try {
    const accounts = await getCustomerAccounts(client);
    console.log('Connected successfully. Accounts found:', accounts.length);
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}
// Get real-time quote for a symbol using Yahoo Finance
export async function getQuote(client: any, symbol: string): Promise<number | null> {
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
    if (response.ok) {
      const data = await response.json();
      const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
      return price && typeof price === 'number' ? price : null;
    }
    return null;
  } catch (error) {
    console.error(`Error getting quote for ${symbol}:`, error);
    return null;
  }
}

export default {
  createTastytradeClient,
  getCustomerAccounts,
  getAccountByNumber,
  testConnection
};
