import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { marketApi } from '../api/market';

const fallbackIndices = [
  { name: '上证', code: '000001', value: 3245.67, change: 0.82, trend: 'up' },
  { name: '深证', code: '399001', value: 11234.56, change: -0.23, trend: 'down' },
  { name: '创业板', code: '399006', value: 2234.78, change: 1.45, trend: 'up' },
  { name: '纳指', code: 'IXIC', value: 17234.13, change: 0.56, trend: 'up' },
  { name: 'A50', code: 'CN50', value: 13245.87, change: -0.41, trend: 'down' }
];

const MarketTicker = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketPulse = useCallback(() => {
    setLoading(true);
    setError(null);

    marketApi
      .getMarketPulse()
      .then((data) => {
        if (data && data.indices) {
          setMarketData(data);
        } else {
          setMarketData({ indices: fallbackIndices });
        }
      })
      .catch((err) => {
        console.error('大盘数据获取失败:', err);
        setError('数据加载失败');
        setMarketData({ indices: fallbackIndices });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchMarketPulse();
  }, [fetchMarketPulse]);

  useEffect(() => {
    const interval = setInterval(fetchMarketPulse, 30000);
    return () => clearInterval(interval);
  }, [fetchMarketPulse]);

  const indices = useMemo(() => {
    if (marketData?.indices?.length >= 5) {
      return marketData.indices.slice(0, 5);
    }
    return fallbackIndices;
  }, [marketData]);

  const marqueeItems = useMemo(() => [...indices, ...indices], [indices]);

  if (loading) {
    return (
      <div className="market-ticker">
        <div className="ticker-loading">
          <div className="loading-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
          <span style={{ marginLeft: '8px' }}>加载中</span>
        </div>
      </div>
    );
  }

  if (error || !indices.length) {
    return (
      <div className="market-ticker">
        <div className="ticker-error">
          <span>数据暂不可用</span>
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
            <span className="ticker-value">{item.value?.toFixed(2) || '--'}</span>
            <span className={`ticker-change ${item.trend}`}>
              {item.trend === 'up' ? '+' : ''}{item.change?.toFixed(2) || '--'}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;
