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

interface HedgeAnalysis {
  fundingSize: number;
  qqqPrice: number;
  hedgeRatio: number;
  currentHedgeCount: number;
  coverageRatio: number;
  status: 'underhedged' | 'adequatelyhedged' | 'overhedged';
  recommendation: string;
  formula: string;
  estimatedCost: number;
}

function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [fundingSize, setFundingSize] = useState<number>(0);
  const [hedgeRecommendations, setHedgeRecommendations] = useState<HedgeRecommendation[]>([]);
  const [qqqPrice, setQqqPrice] = useState<number>(395.50);
  const [hedgeAnalysis, setHedgeAnalysis] = useState<HedgeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

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
      setHedgeAnalysis(data.hedgeAnalysis || null);
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
              
              {/* QQQ Put Hedge - Important Section - Moved Up */}
              {hedgeAnalysis && (
                <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-indigo-200">
                    <h3 className="text-lg font-bold text-indigo-900">QQQ Put Hedge Status</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase mb-1">Funding Size</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(hedgeAnalysis.fundingSize)}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-500 uppercase mb-1">QQQ Price</p>
                        <p className="text-2xl font-bold text-gray-900">${hedgeAnalysis.qqqPrice.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Current Hedge</p>
                        <p className="text-3xl font-bold text-gray-900">{hedgeAnalysis.currentHedgeCount} contracts</p>
                        <p className="text-xs text-gray-500">Long QQQ PUT options</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Coverage</p>
                        <p className={`text-3xl font-bold ${hedgeAnalysis.status === 'underhedged' ? 'text-red-600' : hedgeAnalysis.status === 'overhedged' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {hedgeAnalysis.coverageRatio.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">of funding size</p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg mb-3 ${
                      hedgeAnalysis.status === 'underhedged' ? 'bg-red-100 border-l-4 border-red-500' :
                      hedgeAnalysis.status === 'overhedged' ? 'bg-yellow-100 border-l-4 border-yellow-500' :
                      'bg-green-100 border-l-4 border-green-500'
                    }`}>
                      <p className="text-sm font-bold text-gray-700 mb-1">
                        Status: {hedgeAnalysis.status.toUpperCase().replace('ADEQUATELYHEDED', 'ADEQUATELY HEDGED')}
                      </p>
                      <p className="text-gray-900 font-medium">{hedgeAnalysis.recommendation}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Formula: (PUT Qty × 100 × QQQ Price) / Funding Size</p>
                      <p className="text-xs font-mono text-gray-700">{hedgeAnalysis.formula}</p>
                    </div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pos['instrument-type'] === 'Equity' ? '1.0' : '0.5'}
                        </td>
                      </tr>
                    ))}
                    {positions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No positions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
