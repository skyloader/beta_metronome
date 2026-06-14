"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTastytradeClient = createTastytradeClient;
exports.getCustomerAccounts = getCustomerAccounts;
exports.getAccountByNumber = getAccountByNumber;
exports.testConnection = testConnection;
exports.getQuote = getQuote;
const api_1 = __importDefault(require("@tastytrade/api"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Load token info from token.info file
function loadTokenInfo() {
    const tokenPath = path.join(__dirname, '..', 'token.info');
    const content = fs.readFileSync(tokenPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const tokenInfo = {};
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
function createTastytradeClient() {
    const { client_secret, refresh_token } = loadTokenInfo();
    if (!client_secret || !refresh_token) {
        throw new Error('Missing required credentials in token.info');
    }
    const client = new api_1.default({
        baseUrl: 'https://api.tastyworks.com',
        accountStreamerUrl: 'wss://streamer.tastyworks.com',
        clientSecret: client_secret,
        refreshToken: refresh_token,
        oauthScopes: ['read', 'trade']
    });
    return client;
}
// Get all customer accounts
async function getCustomerAccounts(client) {
    const response = await client.accountsAndCustomersService.getCustomerAccounts();
    // Log response structure for debugging
    console.log('Full response:', JSON.stringify(response, null, 2));
    // Response is array directly, not response.items
    return Array.isArray(response) ? response : response.items || [];
}
// Get account by number
async function getAccountByNumber(client, accountNumber) {
    const accounts = await getCustomerAccounts(client);
    return accounts.find((acc) => acc.account['account-number'] === accountNumber);
}
// Test client connection
async function testConnection(client) {
    try {
        const accounts = await getCustomerAccounts(client);
        console.log('Connected successfully. Accounts found:', accounts.length);
        return true;
    }
    catch (error) {
        console.error('Connection test failed:', error);
        return false;
    }
}
// Get real-time quote for a symbol using Yahoo Finance
async function getQuote(client, symbol) {
    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
        if (response.ok) {
            const data = await response.json();
            const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
            return price && typeof price === 'number' ? price : null;
        }
        return null;
    }
    catch (error) {
        console.error(`Error getting quote for ${symbol}:`, error);
        return null;
    }
}
exports.default = {
    createTastytradeClient,
    getCustomerAccounts,
    getAccountByNumber,
    testConnection
};
//# sourceMappingURL=client.js.map