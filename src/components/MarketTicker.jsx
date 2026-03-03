import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api';

// 只有在彻底断网或接口 404 时才显示的垫底数据
const EMERGENCY_DATA = [
  { name: '上证指数', code: '000001', value: '--', change: 0 },
  { name: '深证成指', code: '399001', value: '--', change: 0 },
  { name: '创业板指', code: '399006', value: '--', change: 0 },
  { name: '纳斯达克', code: 'IXIC', value: '--', change: 0 }
];

const MarketTicker = () => {
  const [indices, setIndices] = useState([]);
  const [status, setStatus] = useState('connecting'); // connecting | live | offline

  const fetchMarketData = useCallback(async () => {
    try {
      const res = await api.get('/api/market_marquee');
      if (res && res.status === 'success' && res.indices && res.indices.length > 0) {
        setIndices(res.indices);
        setStatus('live');
      } else {
        // 如果后端返回成功但没数据，视为离线状态
        if (status === 'connecting') setStatus('offline');
      }
    } catch (err) {
      console.error("跑马灯请求失败:", err);
      setStatus('offline');
    }
  }, [status]);

  useEffect(() => {
    // 初始加载
    fetchMarketData();
    // 30秒轮询
    const timer = setInterval(fetchMarketData, 30000);
    return () => clearInterval(timer);
  }, [fetchMarketData]);

  // 生成滚动列表（双倍拼接实现无缝滚动）
  const scrollItems = useMemo(() => {
    const baseData = indices.length > 0 ? indices : EMERGENCY_DATA;
    return [...baseData, ...baseData];
  }, [indices]);

  return (
    <div className="w-full bg-slate-900 overflow-hidden py-2 select-none border-y border-slate-800">
      <div className="flex whitespace-nowrap animate-marquee">
        {scrollItems.map((item, idx) => {
          const val = item.value && item.value !== '--' ? Number(item.value).toFixed(2) : '---';
          const chg = Number(item.change || 0);
          const isUp = chg > 0;
          const isNeutral = chg === 0 || val === '---';

          return (
            <div 
              key={`${item.code}-${idx}`} 
              className="inline-flex items-center mx-6 space-x-2"
            >
              <span className="text-slate-400 text-xs font-medium">{item.name}</span>
              <span className={`text-sm font-mono font-bold ${
                isNeutral ? 'text-slate-500' : isUp ? 'text-red-400' : 'text-green-400'
              }`}>
                {status === 'connecting' && val === '---' ? (
                  <span className="animate-pulse">连接中...</span>
                ) : (
                  <>
                    {val}
                    {!isNeutral && (
                      <span className="ml-1 text-[10px]">
                        {isUp ? '▲' : '▼'}{Math.abs(chg).toFixed(2)}%
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tailwind 动画定义 - 请确保你的 tailwind.config.js 有 marquee 动画，或者直接在 index.css 添加以下 CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
};

export default MarketTicker;