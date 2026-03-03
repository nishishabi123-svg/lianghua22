import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api';

// 备用数据 (当接口失败时显示)
const fallbackIndices = [
  { name: '上证', code: '000001', value: 3245.67, change: 0.82 },
  { name: '深证', code: '399001', value: 11234.56, change: -0.23 },
  { name: '创业板', code: '399006', value: 2234.78, change: 1.45 },
  { name: '纳指', code: 'IXIC', value: 14256.89, change: 0.35 },
  { name: 'A50', code: 'A50', value: 13456.23, change: -0.12 }
];

const MarketTicker = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMarketMarquee = useCallback(async () => {
    try {
      const res = await api.get('/api/market_marquee');
      console.log("🔍 跑马灯原始数据:", res);
      
      // 辅助函数：安全提取价格 (转为数字)
      const getPrice = (obj) => {
        if (!obj || obj.price === undefined || obj.price === null) return null;
        // 去除逗号并转浮点数，处理 "12,150.00" 或 "12150.00"
        return parseFloat(String(obj.price).replace(/,/g, ''));
      };
      
      // 辅助函数：安全提取涨跌幅 (转为数字)
      const getChange = (obj) => {
        if (!obj || !obj.change) return 0;
        // 处理 "+0.85%" -> 0.85
        const val = parseFloat(String(obj.change).replace('%', ''));
        return isNaN(val) ? 0 : val;
      };

      const mapped = [];

      // 1. 尝试提取纳指
      if (res.nasdaq) {
        mapped.push({ 
          name: '纳指', code: 'IXIC', 
          value: getPrice(res.nasdaq), 
          change: getChange(res.nasdaq) 
        });
        console.log("✅ 纳指数据:", mapped[mapped.length-1]);
      } else {
        console.warn("❌ 未找到 nasdaq 字段");
      }

      // 2. 尝试提取 A50
      if (res.a50) {
        mapped.push({ 
          name: 'A50', code: 'A50', 
          value: getPrice(res.a50), 
          change: getChange(res.a50) 
        });
        console.log("✅ A50 数据:", mapped[mapped.length-1]);
      } else {
        console.warn("❌ 未找到 a50 字段");
      }

      // 3. 尝试提取上证
      if (res.shanghai) {
        mapped.push({ 
          name: '上证', code: '000001', 
          value: getPrice(res.shanghai), 
          change: getChange(res.shanghai) 
        });
        console.log("✅ 上证数据:", mapped[mapped.length-1]);
      } else {
        console.warn("❌ 未找到 shanghai 字段");
      }
      
      // 更新状态
      if (mapped.length > 0) {
        console.log("🎉 最终映射数据:", mapped);
        setMarketData({ indices: mapped });
      } else {
        console.error("💥 所有指数数据解析失败，使用备用数据");
        setMarketData({ indices: fallbackIndices });
      }
    } catch (err) {
      console.error('🚨 获取跑马灯数据异常:', err);
      setMarketData({ indices: fallbackIndices });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketMarquee();
    // 每 60 秒刷新一次
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
        {marqueeItems.map((item, idx) => {
          // 确保数值有效
          const val = item.value !== null ? Number(item.value).toFixed(2) : '--';
          const chg = Number(item.change || 0);
          const isUp = chg >= 0;
          
          return (
            <div key={`${item.code}-${idx}`} className="ticker-item">
              <span className="ticker-name">{item.name}</span>
              <span className={`ticker-value ${isUp ? 'ticker-up' : 'ticker-down'}`}>
                {val}
              </span>
              <span className={`ticker-change ${isUp ? 'ticker-up' : 'ticker-down'}`}>
                {isUp ? '▲' : '▼'}{Math.abs(chg).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketTicker;