import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api';

const fallbackIndices = [
  { name: '上证', code: '000001', value: 3245.67, change: 0.82, trend: 'up' },
  { name: '深证', code: '399001', value: 11234.56, change: -0.23, trend: 'down' },
  { name: '创业板', code: '399006', value: 2234.78, change: 1.45, trend: 'up' }
];

const MarketTicker = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMarketPulse = useCallback(async () => {
    try {
      const res = await api.get('/api/market_index');
      if (res && (res.indices || res.data?.indices)) {
        setMarketData(res.indices || res.data.indices);
      }
    } catch (err) {
      console.error('大盘数据获取失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketPulse();
    const interval = setInterval(fetchMarketPulse, 30000);
    return () => clearInterval(interval);
  }, [fetchMarketPulse]);

  const displayData = useMemo(() => marketData || fallbackIndices, [marketData]);

  return (
    <div className="flex items-center gap-8 overflow-hidden whitespace-nowrap py-2">
      {displayData.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-600">{item.name}</span>
          <span className={`text-sm font-mono font-bold ${item.change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {item.value?.toFixed(2)}
          </span>
          <span className={`text-[10px] ${item.change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
            {item.change >= 0 ? '▲' : '▼'}{Math.abs(item.change)}%
          </span>
        </div>
      ))}
    </div>
  );
};

export default MarketTicker;