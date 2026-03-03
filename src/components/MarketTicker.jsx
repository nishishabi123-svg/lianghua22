// 在 MarketTicker.jsx 中，找到初始化 state 的地方
const [tickers, setTickers] = useState([
  { symbol: 'sh000001', name: '上证指数', price: '3345.67', change: '+0.5%' },
  { symbol: 'sz399001', name: '深证成指', price: '10234.56', change: '-0.2%' },
  { symbol: 'XIN9', name: 'A50期指', price: '13456.78', change: '+1.1%' },
  { symbol: 'USIXIC', name: '纳斯达克', price: '17890.12', change: '+0.8%' }
]);

// 然后在 useEffect 中，先设置假数据，再异步请求真实数据
useEffect(() => {
  // 立即显示假数据，避免白屏
  setTickers(prev => prev.length === 0 ? [
    { symbol: 'sh000001', name: '上证指数', price: '3345.67', change: '+0.5%' },
    { symbol: 'sz399001', name: '深证成指', price: '10234.56', change: '-0.2%' },
    { symbol: 'XIN9', name: 'A50期指', price: '13456.78', change: '+1.1%' },
    { symbol: 'USIXIC', name: '纳斯达克', price: '17890.12', change: '+0.8%' }
  ] : prev);

  const fetchTickers = async () => {
    try {
      const data = await fetchMarketMarquee();
      if (data && data.length > 0) {
        setTickers(data);
      }
    } catch (err) {
      console.error('Failed to fetch tickers:', err);
      // 保持假数据不变
    }
  };

  fetchTickers();

  const interval = setInterval(fetchTickers, 60000); // 1分钟刷新
  return () => clearInterval(interval);
}, []);