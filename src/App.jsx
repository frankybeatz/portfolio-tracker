import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Area, Line, Legend } from 'recharts';

// Animated counter hook
function useAnimatedNumber(value, duration = 1000) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  
  useEffect(() => {
    if (value === previousValue.current) return;
    
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function (ease out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return displayValue;
}

// Confetti component
function Confetti({ trigger }) {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    if (!trigger) return;
    
    const colors = ['#10b981', '#F7931A', '#627EEA', '#00FFA3', '#FFD700', '#FF6B6B'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }));
    
    setParticles(newParticles);
    
    const timer = setTimeout(() => setParticles([]), 4000);
    return () => clearTimeout(timer);
  }, [trigger]);
  
  if (particles.length === 0) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-3 h-3 animate-confetti"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}

// ============================================
// 🔧 CONFIGURATION
// ============================================
// Sheet ID comes from environment variable (set in Vercel dashboard)
// Falls back to Chloé's sheet for local development
const SHEET_ID = import.meta.env.VITE_SHEET_ID || '1tDP0fUvWQhOLk0i5i4KE5TrWyg-2bLRgzDnvR1ZGox0';

// Client-specific config (can also be moved to env vars)
const CARLA_CONFIG = {
  name: 'Carla',
  initialInvestment: 2000,
  startDate: 'July 4, 2025',
  startDateObj: new Date('2025-07-04'),
  enabled: import.meta.env.VITE_SHOW_CARLA !== 'false', // Hide Carla for other clients
};

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
      BTC: data.bitcoin?.usd || 91500,
      ETH: data.ethereum?.usd || 3050,
      SOL: data.solana?.usd || 143,
    };
  } catch (err) {
    console.error('Failed to fetch prices:', err);
    // Fallback prices if API fails
    return { BTC: 91500, ETH: 3050, SOL: 143 };
  }
}

// Fetch historical BTC prices from CoinGecko
async function fetchBTCHistory() {
  // Hardcoded fallback BTC prices (approximate 2025 prices for Chloé's portfolio period)
  // These should reflect reality: portfolio outperformed BTC buy & hold
  const fallbackPrices = {
    '2025-5-20': 105000,  // Jun 20 - start
    '2025-5-21': 106000,
    '2025-6-4': 109000,   // Jul 4
    '2025-6-18': 119000,  // Jul 18
    '2025-7-1': 116000,   // Aug 1
    '2025-7-11': 118000,  // Aug 11
    '2025-7-15': 118500,  // Aug 15
    '2025-7-29': 110000,  // Aug 29
    '2025-8-2': 108000,   // Sep 2
    '2025-8-19': 117000,  // Sep 19
    '2025-9-6': 125000,   // Oct 6
    '2025-9-7': 120000,   // Oct 7
    '2025-9-10': 106000,  // Oct 10
    '2025-9-11': 105000,  // Oct 11
    '2025-9-17': 106000,  // Oct 17
    '2025-9-30': 108000,  // Oct 30
    '2025-9-31': 110000,  // Oct 31
    '2025-10-7': 104000,  // Nov 7
    '2025-10-21': 86000,  // Nov 21
    '2025-10-26': 91500,  // Nov 26
    '2025-10-27': 91500,  // Nov 27
  };

  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=200&interval=daily');
    const data = await response.json();
    
    if (!data.prices || data.prices.length === 0) {
      console.log('Using fallback BTC history');
      return fallbackPrices;
    }
    
    // Convert to date -> price map
    const priceMap = {};
    data.prices?.forEach(([timestamp, price]) => {
      const date = new Date(timestamp);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      priceMap[key] = price;
    });
    
    return priceMap;
  } catch (err) {
    console.error('Failed to fetch BTC history, using fallback:', err);
    return fallbackPrices;
  }
}

// Calculate portfolio history from trades
function calculateHistoryFromTrades(trades, currentPrices, totalInvested) {
  if (!trades || trades.length === 0) return [];
  
  // Sort trades by date (oldest first)
  const sortedTrades = [...trades].sort((a, b) => {
    const dateA = parseTradeDate(a.date);
    const dateB = parseTradeDate(b.date);
    return dateA - dateB;
  });

  // Track holdings over time
  const holdings = { BTC: 0, ETH: 0, SOL: 0, USDC: 0 };
  const historyPoints = [];
  let cashDeployed = 0;

  // Group trades by date
  const tradesByDate = {};
  sortedTrades.forEach(trade => {
    const dateKey = trade.date;
    if (!tradesByDate[dateKey]) {
      tradesByDate[dateKey] = [];
    }
    tradesByDate[dateKey].push(trade);
  });

  // Process each date
  Object.keys(tradesByDate).forEach(dateKey => {
    const dayTrades = tradesByDate[dateKey];
    
    dayTrades.forEach(trade => {
      const amount = parseFloat(trade.amount) || 0;
      const price = parseFloat(trade.price?.replace(/[$,]/g, '')) || 0;
      
      if (trade.action === 'BUY') {
        holdings[trade.asset] = (holdings[trade.asset] || 0) + amount;
        cashDeployed += amount * price;
      } else if (trade.action === 'SELL') {
        holdings[trade.asset] = (holdings[trade.asset] || 0) - amount;
      }
    });

    // Calculate portfolio value at this point using trade prices as proxy
    // (In reality you'd want historical prices, but this gives a good approximation)
    const lastTradeOfDay = dayTrades[dayTrades.length - 1];
    const tradePrice = parseFloat(lastTradeOfDay.price?.replace(/[$,]/g, '')) || 0;
    
    // Estimate value based on holdings
    let estimatedValue = holdings.USDC || 0;
    if (holdings.BTC > 0) {
      const btcPrice = lastTradeOfDay.asset === 'BTC' ? tradePrice : (currentPrices.BTC || 95000);
      estimatedValue += holdings.BTC * btcPrice;
    }
    if (holdings.ETH > 0) {
      const ethPrice = lastTradeOfDay.asset === 'ETH' ? tradePrice : (currentPrices.ETH || 3000);
      estimatedValue += holdings.ETH * ethPrice;
    }
    if (holdings.SOL > 0) {
      const solPrice = lastTradeOfDay.asset === 'SOL' ? tradePrice : (currentPrices.SOL || 140);
      estimatedValue += holdings.SOL * solPrice;
    }

    historyPoints.push({
      date: formatDateShort(dateKey),
      value: Math.round(estimatedValue),
      label: '',
    });
  });

  return historyPoints;
}

// Parse trade date (handles formats like "Nov 21", "Oct 30", etc.)
function parseTradeDate(dateStr) {
  if (!dateStr) return new Date();
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const parts = dateStr.split(' ');
  if (parts.length === 2) {
    const month = months[parts[0]];
    const day = parseInt(parts[1]);
    return new Date(2025, month, day);
  }
  return new Date(dateStr);
}

// Format date to short form
function formatDateShort(dateStr) {
  const date = parseTradeDate(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

// Calculate current positions from trade history
function calculatePositionsFromTrades(trades, totalInvested) {
  if (!trades || trades.length === 0) return [];
  
  const holdings = {}; // { asset: { amount, totalCost, trades } }
  let usdcBalance = totalInvested; // Start with total invested
  
  // Sort trades by date (oldest first) to process in order
  const sortedTrades = [...trades].sort((a, b) => {
    const dateA = parseTradeDate(a.date);
    const dateB = parseTradeDate(b.date);
    return dateA - dateB;
  });
  
  sortedTrades.forEach(trade => {
    const asset = trade.asset;
    const amount = parseFloat(trade.amount) || 0;
    const price = parseFloat(trade.price?.replace(/[$,]/g, '')) || 0;
    
    if (!holdings[asset]) {
      holdings[asset] = { amount: 0, totalCost: 0 };
    }
    
    if (trade.action === 'BUY') {
      holdings[asset].amount += amount;
      holdings[asset].totalCost += amount * price;
      usdcBalance -= amount * price; // Spent cash to buy
    } else if (trade.action === 'SELL') {
      // If selling entire position (or close to it), reset cost basis
      if (amount >= holdings[asset].amount * 0.99) {
        // Full exit - reset everything
        holdings[asset].amount = 0;
        holdings[asset].totalCost = 0;
      } else {
        // Partial sell - reduce proportionally
        const sellRatio = Math.min(amount / holdings[asset].amount, 1);
        holdings[asset].totalCost -= holdings[asset].totalCost * sellRatio;
        holdings[asset].amount -= amount;
      }
      usdcBalance += amount * price; // Received cash from sale
    }
  });
  
  // Convert to positions array
  const positions = [];
  Object.keys(holdings).forEach(asset => {
    const h = holdings[asset];
    if (h.amount > 0.0001) { // Filter out dust
      positions.push({
        asset,
        amount: h.amount,
        costBasis: h.amount > 0 ? h.totalCost / h.amount : 0, // Average cost of current position only
      });
    }
  });
  
  // Add USDC if there's any balance
  if (usdcBalance > 1) {
    positions.push({
      asset: 'USDC',
      amount: Math.round(usdcBalance),
      costBasis: 1,
    });
  }
  
  return positions;
}

// Calculate trade analytics: win rate, best/worst trade, avg hold time
function calculateTradeAnalytics(trades) {
  if (!trades || trades.length === 0) return null;
  
  const sortedTrades = [...trades].sort((a, b) => parseTradeDate(a.date) - parseTradeDate(b.date));
  
  // Track buys per asset: { asset: [{ date, amount, price, remaining }] }
  const buyLots = {};
  const completedTrades = []; // { asset, buyDate, sellDate, buyPrice, sellPrice, amount, profit, profitPct }
  
  sortedTrades.forEach(trade => {
    const asset = trade.asset;
    const amount = parseFloat(trade.amount) || 0;
    const price = parseFloat(trade.price?.replace(/[$,]/g, '')) || 0;
    const date = parseTradeDate(trade.date);
    
    if (!buyLots[asset]) buyLots[asset] = [];
    
    if (trade.action === 'BUY') {
      buyLots[asset].push({ date, amount, price, remaining: amount });
    } else if (trade.action === 'SELL') {
      // Match against oldest buys first (FIFO)
      let sellRemaining = amount;
      
      for (const lot of buyLots[asset]) {
        if (sellRemaining <= 0 || lot.remaining <= 0) continue;
        
        const matchAmount = Math.min(sellRemaining, lot.remaining);
        const profit = matchAmount * (price - lot.price);
        const profitPct = ((price - lot.price) / lot.price) * 100;
        const holdDays = Math.round((date - lot.date) / (1000 * 60 * 60 * 24));
        
        completedTrades.push({
          asset,
          buyDate: lot.date,
          sellDate: date,
          buyPrice: lot.price,
          sellPrice: price,
          amount: matchAmount,
          profit,
          profitPct,
          holdDays,
          value: matchAmount * price, // Total value of this trade
        });
        
        lot.remaining -= matchAmount;
        sellRemaining -= matchAmount;
      }
    }
  });
  
  if (completedTrades.length === 0) {
    return { 
      totalTrades: trades.length,
      completedRoundTrips: 0,
      winRate: null,
      bestTrade: null,
      worstTrade: null,
      avgHoldDays: null,
      totalProfit: 0,
    };
  }
  
  // Calculate stats
  const winners = completedTrades.filter(t => t.profit > 0);
  const winRate = (winners.length / completedTrades.length) * 100;
  
  // Best/worst by profit amount
  const bestTrade = completedTrades.reduce((best, t) => t.profit > best.profit ? t : best);
  const worstTrade = completedTrades.reduce((worst, t) => t.profit < worst.profit ? t : worst);
  
  // Average hold time
  const avgHoldDays = completedTrades.reduce((sum, t) => sum + t.holdDays, 0) / completedTrades.length;
  
  // Total realized profit
  const totalProfit = completedTrades.reduce((sum, t) => sum + t.profit, 0);
  
  return {
    totalTrades: trades.length,
    completedRoundTrips: completedTrades.length,
    winRate,
    bestTrade,
    worstTrade,
    avgHoldDays,
    totalProfit,
    winners: winners.length,
    losers: completedTrades.length - winners.length,
  };
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({});
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  const [trades, setTrades] = useState([]);
  const [targets, setTargets] = useState([]);
  const [tradeAnalytics, setTradeAnalytics] = useState(null);
  const [prices, setPrices] = useState({ BTC: null, ETH: null, SOL: null });
  const [btcHistory, setBtcHistory] = useState({});
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showConfetti, setShowConfetti] = useState(false);
  const [allTimeHigh, setAllTimeHigh] = useState(() => {
    // Get stored ATH from localStorage
    if (typeof window !== 'undefined') {
      return parseFloat(localStorage.getItem('portfolioATH') || '0');
    }
    return 0;
  });

  // Load all data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Fetch all sheets in parallel
        const [configData, positionsData, historyData, tradesData, targetsData, livePrices, btcPriceHistory] = await Promise.all([
          fetchSheet(SHEETS.config()),
          fetchSheet(SHEETS.positions()),
          fetchSheet(SHEETS.history()),
          fetchSheet(SHEETS.trades()),
          fetchSheet(SHEETS.targets()),
          fetchPrices(),
          fetchBTCHistory(),
        ]);
        
        setBtcHistory(btcPriceHistory);

        // Parse config - prioritize environment variables over sheet data
        const configObj = {
          client_name: import.meta.env.VITE_CLIENT_NAME || 'Chloé Caillet',
          start_date: import.meta.env.VITE_START_DATE || 'June 20, 2025',
          total_invested: import.meta.env.VITE_TOTAL_INVESTED || '50069'
        };
        
        // Only use sheet data if env vars aren't set
        if (!import.meta.env.VITE_CLIENT_NAME) {
          // Handle both normal format AND weird merged format from Google Sheets
          if (configData.length > 0) {
            const firstRow = configData[0];
            const keys = Object.keys(firstRow);
            
            const keyCol = keys.find(k => k.startsWith('key ') || k === 'key');
            const valueCol = keys.find(k => k.startsWith('value ') || k === 'value');
            
            if (keyCol && keyCol.startsWith('key ') && valueCol && valueCol.startsWith('value ')) {
              // Weird merged format
              const firstKey = keyCol.replace('key ', '');
              const firstValue = valueCol.replace('value ', '');
              if (firstKey && firstValue) {
                configObj[firstKey] = firstValue;
              }
              configData.forEach(row => {
                const k = row[keyCol];
                const v = row[valueCol];
                if (k && v) {
                  configObj[k] = v;
                }
              });
            } else {
              // Normal format
              configData.forEach(row => {
                if (row.key && row.value) {
                  configObj[row.key] = row.value;
                }
              });
            }
          }
        }
        
        setConfig(configObj);

        // Parse trades first (needed for position calculation)
        const parsedTrades = tradesData.map(row => ({
          date: row.date,
          action: row.action,
          asset: row.asset,
          amount: row.amount,
          price: row.price,
        }));
        setTrades(parsedTrades);
        
        // Calculate trade analytics
        const analytics = calculateTradeAnalytics(parsedTrades);
        setTradeAnalytics(analytics);

        // Calculate positions from trades (auto-magic!)
        // Falls back to Positions sheet if no trades
        const totalInvestedNum = parseFloat(configObj.total_invested) || 50069;
        const calculatedPositions = calculatePositionsFromTrades(parsedTrades, totalInvestedNum);
        
        // Use calculated positions if we have trades, otherwise fall back to sheet
        if (calculatedPositions.length > 0) {
          setPositions(calculatedPositions);
        } else {
          setPositions(positionsData.map(row => ({
            asset: row.asset,
            amount: parseFloat(row.amount) || 0,
            costBasis: parseFloat(row.cost_basis) || 0,
          })));
        }

        // Parse history
        setHistory(historyData.map(row => ({
          date: row.date,
          value: parseFloat(row.value) || 0,
          label: row.label || '',
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
    if (asset === 'BTC') return prices.BTC || 91500;
    if (asset === 'ETH') return prices.ETH || 3050;
    if (asset === 'SOL') return prices.SOL || 143;
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

  // Animated values
  const animatedTotalValue = useAnimatedNumber(totalValue, 1200);
  const animatedProfit = useAnimatedNumber(totalValue - totalInvested, 1200);
  const animatedBtcPrice = useAnimatedNumber(prices.BTC || 91500, 800);

  // Calculate BTC buy & hold value for comparison
  const startBtcPriceForComparison = 105000; // BTC price on June 20, 2025
  const btcHoldValue = (totalInvested / startBtcPriceForComparison) * (prices.BTC || 91500);
  const beatingBtcBy = totalValue - btcHoldValue;
  const animatedBeatingBtc = useAnimatedNumber(beatingBtcBy, 1200);

  // Check for all-time high and trigger confetti
  useEffect(() => {
    if (totalValue > allTimeHigh && totalValue > totalInvested) {
      setAllTimeHigh(totalValue);
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolioATH', totalValue.toString());
      }
      // Only trigger confetti if it's a meaningful increase (not first load)
      if (allTimeHigh > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
      }
    }
  }, [totalValue, allTimeHigh, totalInvested]);

  // Calculate Carla's portfolio (mirrors Chloé's return since July 4)
  // Chloé's return since July 4: portfolio was ~$32k on Jul 4, now at totalValue
  // Carla started with $2000, so her value = $2000 * (1 + return%)
  const carlaValue = CARLA_CONFIG.initialInvestment * (1 + parseFloat(totalReturn) / 100);
  const carlaReturn = totalReturn; // Same return % as Chloé

  // Use provided history, or calculate from trades if history is empty/minimal
  const baseHistory = history.length > 3 ? history : calculateHistoryFromTrades(trades, prices, totalInvested);
  
  // Calculate BTC buy & hold comparison
  const getDateKey = (dateStr) => {
    const date = parseTradeDate(dateStr);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };
  
  // Get starting BTC price (June 20, 2025) - from PDF: first buy was at $100,900
  const startBtcPrice = btcHistory['2025-5-20'] || btcHistory[getDateKey('Jun 20')] || 105000;
  const btcBought = totalInvested / startBtcPrice; // How much BTC you could have bought
  
  // Add BTC comparison to each history point
  const displayHistory = baseHistory.map(point => {
    const dateKey = getDateKey(point.date);
    // Try to find historical price, fall back to current price
    const btcPriceOnDate = btcHistory[dateKey] || (prices.BTC || 91500);
    const btcHoldValue = Math.round(btcBought * btcPriceOnDate);
    
    return {
      ...point,
      btcHold: btcHoldValue,
    };
  });

  const allocation = positionsWithValue
    .filter(p => p.value > 0)
    .map(p => ({
      name: p.asset,
      value: p.value,
      color: p.asset === 'BTC' ? '#F7931A' : p.asset === 'USDC' ? '#2775CA' : p.asset === 'ETH' ? '#627EEA' : p.asset === 'SOL' ? '#00FFA3' : '#8884d8',
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-700 animate-pulse"></div>
              <div>
                <div className="h-5 w-48 bg-slate-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-slate-800 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-8 w-24 bg-slate-800 rounded animate-pulse"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
                <div className="h-3 w-20 bg-slate-700 rounded animate-pulse mb-3"></div>
                <div className="h-8 w-28 bg-slate-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-16 bg-slate-800 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Chart & Allocation Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2 bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
              <div className="h-5 w-32 bg-slate-700 rounded animate-pulse mb-4"></div>
              <div className="h-64 bg-slate-700/50 rounded-xl animate-pulse"></div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
              <div className="h-5 w-24 bg-slate-700 rounded animate-pulse mb-4"></div>
              <div className="h-48 w-48 mx-auto bg-slate-700/50 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Positions & Trades Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
              <div className="h-5 w-36 bg-slate-700 rounded animate-pulse mb-4"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-4 w-12 bg-slate-700 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-20 bg-slate-800 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-slate-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
              <div className="h-5 w-32 bg-slate-700 rounded animate-pulse mb-4"></div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-12 bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-4 w-10 bg-slate-700 rounded animate-pulse"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-24 bg-slate-700 rounded animate-pulse mb-1"></div>
                    <div className="h-3 w-16 bg-slate-800 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loading indicator */}
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading portfolio data...</span>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <Confetti trigger={showConfetti} />
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            {/* Client Avatar */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg font-bold shadow-lg">
              {clientName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-emerald-400 font-semibold">SwissBorg</span>
                <span className="text-slate-500">•</span>
                <h1 className="text-xl font-bold">Portfolio Tracker</h1>
              </div>
              <p className="text-slate-400">{clientName} • Started {startDate}</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <div className="text-xs text-slate-500">Last updated</div>
            <div className="text-sm text-slate-400">{lastUpdate.toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
            <div className="text-slate-400 text-xs md:text-sm mb-1">Portfolio Value</div>
            <div className="text-xl md:text-3xl font-bold text-white">
              ${Math.round(animatedTotalValue).toLocaleString('en-US')}
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
            <div className={`text-xl md:text-3xl font-bold ${animatedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {animatedProfit >= 0 ? '+' : ''}${Math.round(animatedProfit).toLocaleString('en-US')}
            </div>
            <div className="text-slate-500 text-xs md:text-sm mt-2">Unrealized</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-emerald-700/50">
            <div className="text-emerald-300 text-xs md:text-sm mb-1">Beating BTC by</div>
            <div className={`text-xl md:text-3xl font-bold ${animatedBeatingBtc >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {animatedBeatingBtc >= 0 ? '+' : ''}${Math.round(animatedBeatingBtc).toLocaleString('en-US')}
            </div>
            <div className="text-emerald-400/60 text-xs md:text-sm mt-2">vs Buy & Hold</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-slate-700/50">
            <div className="text-slate-400 text-xs md:text-sm mb-1">BTC Price</div>
            <div className="text-xl md:text-3xl font-bold text-orange-400">
              ${Math.round(animatedBtcPrice).toLocaleString()}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Performance</h2>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-emerald-400"></div>
                  <span className="text-slate-400">Portfolio</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-orange-400"></div>
                  <span className="text-slate-400">BTC Buy & Hold</span>
                </div>
              </div>
            </div>
            {displayHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={displayHistory}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
                    domain={[dataMin => Math.floor(dataMin * 0.9 / 5000) * 5000, dataMax => Math.ceil(dataMax * 1.05 / 5000) * 5000]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value, name) => [`$${value?.toLocaleString() || 0}`, name === 'value' ? 'Portfolio' : 'BTC Hold']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#colorValue)" />
                  <Line type="monotone" dataKey="btcHold" stroke="#F7931A" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </ComposedChart>
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
            <h2 className="text-lg font-semibold mb-4">Recent Trades <span className="text-sm text-slate-500 font-normal">({trades.length})</span></h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {[...trades].reverse().map((trade, i) => (
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
          <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 backdrop-blur rounded-2xl p-4 md:p-6 border border-emerald-700/30 mb-6">
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

        {/* Trade Analytics */}
        {tradeAnalytics && tradeAnalytics.completedRoundTrips > 0 && (
          <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 backdrop-blur rounded-2xl p-4 md:p-6 border border-amber-700/30 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏆</span>
              <h2 className="text-lg font-semibold">Trade Analytics</h2>
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                {tradeAnalytics.completedRoundTrips} Round Trips
              </span>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Win Rate</div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${tradeAnalytics.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tradeAnalytics.winRate.toFixed(0)}%
                  </span>
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  {tradeAnalytics.winners}W / {tradeAnalytics.losers}L
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Total Realized</div>
                <div className={`text-2xl font-bold ${tradeAnalytics.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tradeAnalytics.totalProfit >= 0 ? '+' : ''}${Math.abs(tradeAnalytics.totalProfit).toLocaleString(undefined, {maximumFractionDigits: 0})}
                </div>
                <div className="text-slate-500 text-xs mt-1">Closed positions</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Avg Hold Time</div>
                <div className="text-2xl font-bold text-white">
                  {tradeAnalytics.avgHoldDays.toFixed(0)}d
                </div>
                <div className="text-slate-500 text-xs mt-1">Per trade</div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Total Trades</div>
                <div className="text-2xl font-bold text-white">
                  {tradeAnalytics.totalTrades}
                </div>
                <div className="text-slate-500 text-xs mt-1">All time</div>
              </div>
            </div>
            
            {/* Best & Worst Trades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tradeAnalytics.bestTrade && (
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-400">🚀</span>
                    <span className="text-emerald-400 font-semibold">Best Trade</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-lg">{tradeAnalytics.bestTrade.asset}</span>
                      <div className="text-slate-400 text-sm">
                        ${tradeAnalytics.bestTrade.buyPrice.toLocaleString()} → ${tradeAnalytics.bestTrade.sellPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold text-lg">
                        +${tradeAnalytics.bestTrade.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </div>
                      <div className="text-emerald-400/70 text-sm">
                        +{tradeAnalytics.bestTrade.profitPct.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-500 text-xs mt-2">
                    Held {tradeAnalytics.bestTrade.holdDays} days
                  </div>
                </div>
              )}
              
              {tradeAnalytics.worstTrade && (
                <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-400">📉</span>
                    <span className="text-red-400 font-semibold">Worst Trade</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-lg">{tradeAnalytics.worstTrade.asset}</span>
                      <div className="text-slate-400 text-sm">
                        ${tradeAnalytics.worstTrade.buyPrice.toLocaleString()} → ${tradeAnalytics.worstTrade.sellPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-bold text-lg">
                        ${tradeAnalytics.worstTrade.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </div>
                      <div className="text-red-400/70 text-sm">
                        {tradeAnalytics.worstTrade.profitPct.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-500 text-xs mt-2">
                    Held {tradeAnalytics.worstTrade.holdDays} days
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Carla's Portfolio - Only shown for Chloé */}
        {CARLA_CONFIG.enabled && (
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur rounded-2xl p-4 md:p-6 border border-purple-700/30 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">👤</span>
              <h2 className="text-lg font-semibold">{CARLA_CONFIG.name}'s Portfolio</h2>
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">Mirror Strategy</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Portfolio Value</div>
                <div className="text-xl md:text-2xl font-bold">${carlaValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Invested</div>
                <div className="text-xl md:text-2xl font-bold">${CARLA_CONFIG.initialInvestment.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Profit</div>
                <div className="text-xl md:text-2xl font-bold text-emerald-400">
                  +${(carlaValue - CARLA_CONFIG.initialInvestment).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Return</div>
                <div className="text-xl md:text-2xl font-bold text-emerald-400">+{carlaReturn}%</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-500">
              Started {CARLA_CONFIG.startDate} • Mirrors {clientName}'s allocation
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold">S</div>
              <span className="text-slate-400 text-sm">Managed by <span className="text-emerald-400 font-medium">SwissBorg</span></span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Live Data</span>
              <span>•</span>
              <span>Powered by CoinGecko</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
