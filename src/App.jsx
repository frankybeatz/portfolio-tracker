import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// ============================================
// 🔧 CONFIGURATION - UPDATE THIS WITH YOUR SHEET ID
// ============================================
const SHEET_ID = '1tDP0fUvWQhOLk0i5i4KE5TrWyg-2bLRgzDnvR1ZGox0';;

// Sheet URLs (each tab published as CSV) - with cache buster
const cacheBuster = () => `&_cb=${Date.now()}`;
const SHEETS = {
  config: () => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Config${cacheBuster()}`,
  positions: () => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Positions${cacheBuster()}`,
  history: () => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=History${cacheBuster()}`,
  trades: () => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Trades${cacheBuster()}`,
  targets: () => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Targets${cacheBuster()}`,
};

// Fetch and parse a CSV sheet
async function fetchSheet(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    return result.data;
  } catch (err) {
    console.error('Failed to fetch sheet:', err);
    return [];
  }
}

// Fetch live crypto prices from CoinGecko
async function fetchPrices() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
    const data = await response.json();
    return {
      BTC: data.bitcoin?.usd || null,
      ETH: data.ethereum?.usd || null,
      SOL: data.solana?.usd || null,
    };
  } catch (err) {
    console.error('Failed to fetch prices:', err);
    return { BTC: null, ETH: null, SOL: null };
  }
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({});
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [trades, setTrades] = useState([]);
  const [targets, setTargets] = useState([]);
  const [prices, setPrices] = useState({ BTC: null, ETH: null, SOL: null });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Load all data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Fetch all sheets in parallel
        const [configData, positionsData, historyData, tradesData, targetsData, livePrices] = await Promise.all([
          fetchSheet(SHEETS.config()),
          fetchSheet(SHEETS.positions()),
          fetchSheet(SHEETS.history()),
          fetchSheet(SHEETS.trades()),
          fetchSheet(SHEETS.targets()),
          fetchPrices(),
        ]);

        // Parse config (key-value pairs)
        const configObj = {};
        configData.forEach(row => {
          if (row.key && row.value) {
            configObj[row.key] = row.value;
          }
        });
        setConfig(configObj);

        // Parse positions
        setPositions(positionsData.map(row => ({
          asset: row.asset,
          amount: parseFloat(row.amount) || 0,
          costBasis: parseFloat(row.cost_basis) || 0,
        })));

        // Parse history
        setHistory(historyData.map(row => ({
          date: row.date,
          value: parseFloat(row.value) || 0,
          label: row.label || '',
        })));

        // Parse trades
        setTrades(tradesData.map(row => ({
          date: row.date,
          action: row.action,
          asset: row.asset,
          amount: row.amount,
          price: row.price,
        })));

        // Parse targets (only asset and target needed - current price is live)
        setTargets(targetsData.map(row => ({
          asset: row.asset,
          target: parseFloat(row.target) || 0,
        })));

        setPrices(livePrices);
        setLastUpdate(new Date());
        setLoading(false);
      } catch (err) {
        setError('Failed to load portfolio data');
        setLoading(false);
      }
    }

    loadData();

    // Refresh prices every 30 seconds
    const priceInterval = setInterval(async () => {
      const newPrices = await fetchPrices();
      if (newPrices.BTC) {
        setPrices(newPrices);
        setLastUpdate(new Date());
      }
    }, 30000);

    // Refresh sheet data every 5 minutes
    const dataInterval = setInterval(loadData, 300000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(dataInterval);
    };
  }, []);

  // Calculate portfolio values
  const getAssetPrice = (asset) => {
    if (asset === 'BTC') return prices.BTC || 0;
    if (asset === 'ETH') return prices.ETH || 0;
    if (asset === 'SOL') return prices.SOL || 0;
    if (asset === 'USDC' || asset === 'USD') return 1;
    return 0;
  };

  const positionsWithValue = positions.map(pos => ({
    ...pos,
    price: getAssetPrice(pos.asset),
    value: pos.amount * getAssetPrice(pos.asset),
  }));

  const totalValue = positionsWithValue.reduce((sum, pos) => sum + pos.value, 0);
  const totalInvested = parseFloat(config.total_invested) || 0;
  const totalReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested * 100).toFixed(1) : 0;
  const clientName = config.client_name || 'Portfolio';
  const startDate = config.start_date || '';

  const allocation = positionsWithValue
    .filter(p => p.value > 0)
    .map(p => ({
      name: p.asset,
      value: p.value,
      color: p.asset === 'BTC' ? '#F7931A' : p.asset === 'USDC' ? '#2775CA' : p.asset === 'ETH' ? '#627EEA' : p.asset === 'SOL' ? '#00FFA3' : '#8884d8',
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-slate-500 text-sm">Check that your Google Sheet is published and the ID is correct.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-slate-900">
                SB
              </div>
              <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
            </div>
            <p className="text-slate-400">{clientName} • Started {startDate}</p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-xs text-slate-500">Last updated</div>
            <div className="text-sm text-slate-400">{lastUpdate.toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
            <div className="text-slate-400 text-xs md:text-sm mb-1">Portfolio Value</div>
            <div className="text-xl md:text-3xl font-bold text-white">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${parseFloat(totalReturn) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {parseFloat(totalReturn) >= 0 ? '+' : ''}{totalReturn}%
              </span>
              <span className="text-slate-500 text-xs md:text-sm">all time</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
            <div className="text-slate-400 text-xs md:text-sm mb-1">Total Invested</div>
            <div className="text-xl md:text-3xl font-bold text-white">
              ${totalInvested.toLocaleString()}
            </div>
            <div className="text-slate-500 text-xs md:text-sm mt-2">Capital deployed</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
            <div className="text-slate-400 text-xs md:text-sm mb-1">Profit</div>
            <div className={`text-xl md:text-3xl font-bold ${totalValue - totalInvested >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalValue - totalInvested >= 0 ? '+' : ''}${(totalValue - totalInvested).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="text-slate-500 text-xs md:text-sm mt-2">Unrealized</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
            <div className="text-slate-400 text-xs md:text-sm mb-1">BTC Price</div>
            <div className="text-xl md:text-3xl font-bold text-orange-400">
              ${prices.BTC?.toLocaleString() || '—'}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-slate-500 text-xs md:text-sm">Live</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart */}
          <div className="md:col-span-2 bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold mb-4">Performance</h2>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-500">No history data</div>
            )}
          </div>

          {/* Allocation */}
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold mb-4">Allocation</h2>
            {allocation.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={allocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {allocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {allocation.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-slate-400">{((item.value / totalValue) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-500">No positions</div>
            )}
          </div>
        </div>

        {/* Positions & Trades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Current Positions */}
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold mb-4">Current Positions</h2>
            <div className="space-y-3">
              {positionsWithValue.filter(p => p.amount > 0).map((pos) => (
                <div key={pos.asset} className="flex items-center justify-between p-3 md:p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pos.asset === 'BTC' ? 'bg-orange-500/20' : 
                      pos.asset === 'ETH' ? 'bg-blue-500/20' : 
                      pos.asset === 'SOL' ? 'bg-emerald-500/20' : 'bg-slate-500/20'
                    }`}>
                      <span className={`font-bold text-sm ${
                        pos.asset === 'BTC' ? 'text-orange-400' : 
                        pos.asset === 'ETH' ? 'text-blue-400' : 
                        pos.asset === 'SOL' ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {pos.asset === 'BTC' ? '₿' : pos.asset === 'USDC' ? '$' : pos.asset.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{pos.asset}</div>
                      <div className="text-slate-400 text-sm">{pos.amount} {pos.asset}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${pos.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                    {pos.costBasis > 0 && (
                      <div className={`text-sm ${pos.price >= pos.costBasis ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pos.price >= pos.costBasis ? '+' : ''}{((pos.price - pos.costBasis) / pos.costBasis * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold mb-4">Recent Trades</h2>
            <div className="space-y-3">
              {trades.slice(0, 6).map((trade, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      trade.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.action}
                    </span>
                    <span className="font-medium">{trade.asset}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-300">{trade.amount} @ {trade.price}</div>
                    <div className="text-xs text-slate-500">{trade.date}</div>
                  </div>
                </div>
              ))}
              {trades.length === 0 && (
                <div className="text-slate-500 text-center py-4">No trades yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Price Targets */}
        {targets.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 backdrop-blur rounded-2xl p-4 md:p-6 border border-emerald-700/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🎯</span>
              <h2 className="text-lg font-semibold">Price Targets</h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">6-12 Month</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {targets.map((t) => {
                const currentPrice = getAssetPrice(t.asset);
                const upside = currentPrice > 0 ? ((t.target - currentPrice) / currentPrice * 100).toFixed(0) : 0;
                return (
                  <div key={t.asset} className="bg-slate-800/50 rounded-xl p-4">
                    <div className="text-slate-400 text-sm mb-1">{t.asset}</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl md:text-2xl font-bold">${t.target.toLocaleString()}</span>
                      <span className="text-emerald-400 text-sm">+{upside}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                      <span>from ${currentPrice.toLocaleString()}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm mt-8">
          SwissBorg Managed Portfolio • Live Data
        </div>
      </div>
    </div>
  );
}
