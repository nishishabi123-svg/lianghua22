import React, { useState, useEffect, useCallback } from 'react';
import { marketApi } from '../api/market';

const MarketTicker = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // 获取大盘脉搏数据
  const fetchMarketPulse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await marketApi.getMarketPulse();
      
      if (data && data.indices) {
        setMarketData(data);
      } else {
        // 使用默认数据作为降级方案
        setMarketData({
          indices: [
            { name: '上证指数', code: '000001', value: 3245.67, change: 0.82, trend: 'up' },
            { name: '深证成指', code: '399001', value: 11234.56, change: -0.23, trend: 'down' },
            { name: '创业板指', code: '399006', value: 2234.78, change: 1.45, trend: 'up' }
          ],
          turnover: '8500.6亿'
        });
      }
    } catch (err) {
      console.error('大盘数据获取失败:', err);
      setError('数据加载失败');
      
      // 降级到mock数据
      setMarketData({
        indices: [
          { name: '上证指数', code: '000001', value: 3245.67, change: 0.82, trend: 'up' },
          { name: '深证成指', code: '399001', value: 11234.56, change: -0.23, trend: 'down' },
          { name: '创业板指', code: '399006', value: 2234.78, change: 1.45, trend: 'up' }
        ],
        turnover: '8500.6亿'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始数据加载
  useEffect(() => {
    fetchMarketPulse();
  }, [fetchMarketPulse]);

  // 定时刷新数据（每30秒）
  useEffect(() => {
    const interval = setInterval(fetchMarketPulse, 30000);
    return () => clearInterval(interval);
  }, [fetchMarketPulse]);

  // 轮播控制
  useEffect(() => {
    if (!marketData || loading) return;
    
    const interval = setInterval(() => {
      setScrollPosition((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, [marketData, loading]);

  // 如果正在加载或没有数据，显示加载状态
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

  if (error || !marketData || !marketData.indices) {
    return (
      <div className="market-ticker">
        <div className="ticker-error">
          <span>数据暂不可用</span>
        </div>
      </div>
    );
  }

  const visibleIndices = [
    marketData.indices[scrollPosition % 3],
    marketData.indices[(scrollPosition + 1) % 3],
    marketData.indices[(scrollPosition + 2) % 3]
  ];

  return (
    <div className="market-ticker">
      <div className="ticker-track">
        {visibleIndices.map((item, idx) => (
          <div key={`${item.code}-${idx}`} className="ticker-item">
            <span className="ticker-name">{item.name}</span>
            <span className="ticker-value">{item.value?.toFixed(2) || '--'}</span>
            <span className={`ticker-change ${item.trend}`}>
              {item.trend === 'up' ? '+' : ''}{item.change?.toFixed(2) || '--'}%
            </span>
          </div>
        ))}
        <div className="ticker-turnover">
          <span className="turnover-label">成交额</span>
          <span className="turnover-value">{marketData.turnover || '--'}</span>
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;