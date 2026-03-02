import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api';

const fallbackIndices = [
  { name: '上证', code: '000001', value: 3245.67, change: 0.82, trend: 'up' },
  { name: '深证', code: '399001', value: 11234.56, change: -0.23, trend: 'down' },
  { name: '创业板', code: '399006', value: 2234.78, change: 1.45, trend: 'up' },
  { name: '纳指', code: 'IXIC', value: 14256.89, change: 0.35, trend: 'up' },
  { name: 'A50', code: 'A50', value: 13456.23, change: -0.12, trend: 'down' }
];

const MarketTicker = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMarketMarquee = useCallback(async () => {
    try {
      // 后端直接返回对象，不需要.data嵌套
      const res = await api.get('/api/market_marquee');
      
      if (res) {
        // 统一字段名，确保变量名一致
        const mapped = [
          { name: '纳指', ...res.nasdaq, value: res.nasdaq?.price },
          { name: 'A50', ...res.a50, value: res.a50?.price },
          { name: '上证', ...res.shanghai, value: res.shanghai?.price }
        ];
        setMarketData({ indices: mapped });
      }
    } catch (err) {
      console.error('获取大盘跑马灯数据失败，使用备用数据');
      setMarketData({ indices: fallbackIndices });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketMarquee();
    // 每30秒调用一次 /api/market_marquee
    const interval = setInterval(fetchMarketMarquee, 30000);
    return () => clearInterval(interval);
  }, [fetchMarketMarquee]);

  // 确保数据翻倍以实现无缝滚动
  const marqueeItems = useMemo(() => {
    const indices = marketData?.indices || fallbackIndices;
    // 复制一份数据用于无缝循环滚动
    return [...indices, ...indices];
  }, [marketData]);

  if (loading) {
    return (
      <div className="market-ticker">
        <div className="ticker-track">
          <div className="text-white text-sm">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="market-ticker">
      <div className="ticker-track ticker-track--marquee">
        {marqueeItems.map((item, idx) => (
          <div key={`${item.code}-${idx}`} className="ticker-item">
            <span className="ticker-name">{item.name}</span>
            <span className={`ticker-value ${item.change >= 0 ? 'ticker-up' : 'ticker-down'}`}>
              {Number(item.value || 0).toFixed(2)}
            </span>
            <span className={`ticker-change ${item.change >= 0 ? 'ticker-up' : 'ticker-down'}`}>
              {item.change >= 0 ? '▲' : '▼'}{Math.abs(Number(item.change) || 0).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;