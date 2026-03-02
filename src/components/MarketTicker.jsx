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
      // 先获取默认大盘数据
      const marketRes = await api.get('/api/market_index');
      if (marketRes && marketRes.data && marketRes.data.indices) {
        setMarketData(marketRes);
      }

      // 再获取600519的macro_data并合并到大盘数据中
      try {
        const decisionRes = await api.get('/api/stock_decision?symbol=600519');
        if (decisionRes && decisionRes.macro_data && Array.isArray(decisionRes.macro_data)) {
          // 将macro_data转换为大盘指数格式并合并
          const macroIndices = decisionRes.macro_data.map(item => ({
            name: item.name || item.index || '宏观指标',
            code: item.code || item.symbol || 'MACRO',
            value: parseFloat(item.value || item.price || 0),
            change: parseFloat(item.change || item.change_percent || 0),
            trend: parseFloat(item.change || item.change_percent || 0) >= 0 ? 'up' : 'down'
          }));

          if (macroIndices.length > 0) {
            setMarketData(prev => ({
              indices: [...(prev?.indices || fallbackIndices), ...macroIndices]
            }));
          }
        }
      } catch (macroErr) {
        console.warn('获取macro_data失败，仅使用大盘数据');
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