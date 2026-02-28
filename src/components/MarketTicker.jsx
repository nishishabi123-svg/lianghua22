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

  const fetchMarketPulse = useCallback(async () => {
    try {
      const res = await api.get('/api/market_index');
      if (res && res.data && res.data.indices) {
        setMarketData(res.data);
      }
    } catch (err) {
      console.error('获取大盘数据失败，使用备用数据');
      setMarketData({ indices: fallbackIndices });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketPulse();
    const interval = setInterval(fetchMarketPulse, 30000);
    return () => clearInterval(interval);
  }, [fetchMarketPulse]);

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
              {item.value?.toFixed(2)}
            </span>
            <span className={`ticker-change ${item.change >= 0 ? 'ticker-up' : 'ticker-down'}`}>
              {item.change >= 0 ? '▲' : '▼'}{Math.abs(item.change)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;