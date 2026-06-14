import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Types
interface Account {
  value: string;
  label: string;
  type: string;
  marginOrCash: string;
}

interface Position {
  'account-number': string;
  'instrument-type': string;
  'streamer-symbol': string;
  symbol: string;
  'underlying-symbol': string;
  quantity: number;
  'average-daily-market-close-price': string;
  'average-open-price': string;
  'average-yearly-market-close-price': string;
  'close-price': string;
  'cost-effect': string;
  'quantity-direction': string;
  'expires-at'?: string;
  'realized-day-gain': string;
  'realized-day-gain-date'?: string;
  'realized-day-gain-effect'?: string;
  'realized-today': string;
  'realized-today-date'?: string;
  'realized-today-effect'?: string;
  'created-at': string;
  'updated-at': string;
  'is-frozen'?: boolean;
  'is-suppressed'?: boolean;
  'multiplier'?: string;
  'restricted-quantity'?: number;
}

interface HedgeRecommendation {
  symbol: string;
  strike: number;
  expiry: string;
  recommendedQuantity: number;
  reason: string;
}

function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [fundingSize, setFundingSize] = useState<number>(0);
  const [hedgeRecommendations, setHedgeRecommendations] = useState<HedgeRecommendation[]>([]);
  const [qqqPrice, setQqqPrice] = useState<number>(395.50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [fundingBreakdown, setFundingBreakdown] = useState<{ stockValue: number; deepITMCallValue: number; totalValue: number; description: string } | null>(null);
  const [calculationDetails, setCalculationDetails] = useState<{ stockPositions: any[]; deepITMCalls: any[]; qqqPrice: number; deepITMThreshold: number } | null>(null);

  // Default account number
  const defaultAccountNumber = '5WX57665';

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/accounts');
      const accountsData: Account[] = response.data.map((acc: { 'account-number': string; 'account-alias'?: string; 'account-type-name': string; 'margin-or-cash': string }) => ({
        value: acc['account-number'],
        label: `${acc['account-number']} - ${acc['account-alias'] || 'N/A'}`,
        type: acc['account-type-name'],
        marginOrCash: acc['margin-or-cash'],
      }));
      setAccounts(accountsData);
      
      // Set default account
      const defaultAccount = accountsData.find(a => a.value === defaultAccountNumber) || accountsData[0];
      if (defaultAccount) {
        setSelectedAccount(defaultAccount);
        loadAccountDetails(defaultAccount.value);
      }
      
      setInitialized(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccountDetails = async (accountNumber: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/accounts/${accountNumber}/details`);
      const data = response.data;
      setPositions(data.positions || []);
      setFundingSize(data.fundingSize || 0);
      setHedgeRecommendations(data.hedgeRecommendations || []);
      setQqqPrice(data.qqqPrice || 395.50);
      setFundingBreakdown(data.fundingBreakdown || null);
      setCalculationDetails(data.calculationDetails || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load account details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountChange = (selected: Account | null) => {
    if (selected) {
      setSelectedAccount(selected);
      loadAccountDetails(selected.value);
    }
  };
  // Get QQQ price from Yahoo Finance
  useEffect(() => {
    const fetchQQQPrice = async () => {
      try {
        const response = await fetch('/quote/QQQ');
        if (response.ok) {
          const data = await response.json();
          const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
          if (price && typeof price === 'number') {
            setQqqPrice(price);
          }
        }
      } catch (error) {
        console.error('Error fetching QQQ price:', error);
      }
    };
    fetchQQQPrice();
  }, []);

  // Live price updates every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(async () => {
      // Update QQQ price
      try {
        const response = await fetch('/quote/QQQ');
        if (response.ok) {
          const data = await response.json();
          const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
          if (price && typeof price === 'number') {
            setQqqPrice(price);
          }
        }
      } catch (error) {
        console.error('Error updating QQQ price:', error);
      }
    }, 5000); // 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getPositionStats = () => {
    const stocks = positions.filter(p => p['instrument-type'] === 'Equity');
    const options = positions.filter(p => p['instrument-type'] === 'Equity Option');
    return { stocks: stocks.length, options: options.length };
  };

  const getPositionDirectionColor = (direction: string) => {
    switch (direction) {
      case 'Long':
      case 'Credit':
        return 'text-green-600';
      case 'Short':
      case 'Debit':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Beta Metronome...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Beta Metronome</h1>
              <p className="text-primary-100 mt-1 text-sm">Tastytrade Dashboard - Portfolio Monitoring & Hedging</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm text-primary-200">Real-time QQQ Price</p>
              <p className="text-xl font-bold">${qqqPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Account Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Account
          </label>
          <Select
            options={accounts}
            value={selectedAccount}
            onChange={handleAccountChange}
            isLoading={isLoading}
            placeholder="Loading accounts..."
            isClearable={false}
          />
        </div>

        {selectedAccount && (
          <>
            {/* Account Summary Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-primary-600">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedAccount.label}
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">
                    {selectedAccount.type} • {selectedAccount.marginOrCash} Account
                  </p>
                </div>
                <div className="text-right bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-4 min-w-[160px]">
                  <p className="text-xs font-medium text-primary-600 uppercase tracking-wider mb-1">Funding Size</p>
                  <p className="text-3xl font-bold text-primary-700">
                    {formatCurrency(fundingSize)}
                  </p>
                </div>
              </div>
              {/* Funding Breakdown */}
              {fundingBreakdown && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    {fundingBreakdown.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-600">Stock Value:</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(fundingBreakdown.stockValue)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-600">Deep ITM Calls:</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(fundingBreakdown.deepITMCallValue)}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <p className="font-semibold text-gray-900">Total: {formatCurrency(fundingBreakdown.totalValue)}</p>
                  </div>
                </div>
              )}
              
              {/* Detailed Calculation */}
              {calculationDetails && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Calculation Details</h4>
                  
                  {/* Stock Positions Calculation */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Stock Positions:</p>
                    <div className="space-y-2">
                      {calculationDetails.stockPositions.map((stock: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm bg-gray-50 rounded-lg p-2">
                          <span className="text-gray-700">{stock.symbol}</span>
                          <span className="text-gray-900 font-mono">
                            {stock.quantity} × ${stock.closePrice.toFixed(2)} = <strong>{formatCurrency(stock.value)}</strong>
                          </span>
                        </div>
                      ))}
                      {calculationDetails.stockPositions.length === 0 && (
                        <p className="text-xs text-gray-500 italic">No stock positions</p>
                      )}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <p className="text-sm font-semibold text-gray-900">
                        Stock Subtotal: {formatCurrency(calculationDetails.stockPositions.reduce((sum: number, s: any) => sum + s.value, 0))}
                      </p>
                    </div>
                  </div>
                  
                  {/* Deep ITM Calls Calculation */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Deep ITM Call Options:</p>
                    <div className="space-y-2">
                      {calculationDetails.deepITMCalls.map((call: any, idx: number) => (
                        <div key={idx} className="flex flex-col text-sm bg-gray-50 rounded-lg p-2">
                          <div className="flex justify-between">
                            <span className="text-gray-700">{call.symbol}</span>
                            <span className="text-gray-900 font-mono">
                              {call.quantity} × 100 × 0.95 × ${calculationDetails.qqqPrice.toFixed(2)} = <strong>{formatCurrency(call.value)}</strong>
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Strike: ${call.strike.toFixed(2)} <span className="mx-1">|</span> QQQ: ${calculationDetails.qqqPrice} <span className="mx-1">|</span> Threshold: ${calculationDetails.deepITMThreshold.toFixed(2)}
                          </div>
                        </div>
                      ))}
                      {calculationDetails.deepITMCalls.length === 0 && (
                        <p className="text-xs text-gray-500 italic">No Deep ITM calls found</p>
                      )}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <p className="text-sm font-semibold text-gray-900">
                        Deep ITM Subtotal: {formatCurrency(calculationDetails.deepITMCalls.reduce((sum: number, c: any) => sum + c.value, 0))}
                      </p>
                    </div>
                  </div>
                  {/* Total */}
                  <div className="mt-3 pt-2 border-t border-gray-300 flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-900">Total Funding Size:</p>
                    <p className="text-lg font-bold text-primary-700">{fundingBreakdown ? formatCurrency(fundingBreakdown.totalValue) : '0'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Position Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border-b-4 border-primary-500">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Stock Positions</p>
                <p className="text-3xl font-bold text-primary-600">
                  {getPositionStats().stocks}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-b-4 border-accent-500">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Option Positions</p>
                <p className="text-3xl font-bold text-accent-600">
                  {getPositionStats().options}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border-b-4 border-primary-600">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">QQQ Put Hedge</p>
                <p className="text-3xl font-bold text-primary-700">
                  {hedgeRecommendations.reduce((acc, r) => acc + r.recommendedQuantity, 0)} 
                  <span className="text-sm text-gray-500 ml-1">contracts</span>
                </p>
              </div>
            </div>

            {/* Positions Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Positions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Direction
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Avg Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Close Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Delta
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {positions.map((pos, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{pos.symbol}</div>
                          <div className="text-sm text-gray-500">{pos['underlying-symbol']}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pos['instrument-type']}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Math.abs(pos.quantity)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPositionDirectionColor(pos['quantity-direction'])}`}>
                          {pos['quantity-direction']}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${parseFloat(pos['average-open-price'] || '0').toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${parseFloat(pos['close-price'] || '0').toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {positions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No positions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QQQ Put Hedge Recommendations */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-primary-500 to-blue-600 text-white">
                <h3 className="text-lg font-bold">
                  QQQ Put Option Hedge Recommendations
                </h3>
              </div>
              <div className="px-6 py-6">
                <p className="text-gray-600 mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-primary-500">
                  <span className="font-semibold text-primary-700">Funding Size:</span> {formatCurrency(fundingSize)} | 
                  <span className="font-semibold text-primary-700 ml-2">Current QQQ Price:</span> ${qqqPrice.toFixed(2)}
                </p>
                
                <div className="grid gap-4">
                  {hedgeRecommendations.map((rec, idx) => (
                    <div key={idx} className="border-2 border-primary-200 rounded-lg p-5 hover:shadow-lg transition-shadow bg-gradient-to-r from-white to-blue-50/50">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="text-xl font-bold text-primary-800">
                            {rec.symbol}
                          </div>
                          <div className="text-sm text-gray-600 mt-1 font-medium">
                            {rec.reason}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary-600">
                            {rec.recommendedQuantity} contracts
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {rec.expiry} • ${rec.strike} strike
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {hedgeRecommendations.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No hedge recommendations available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
