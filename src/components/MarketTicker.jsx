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
    const res = await api.get('/api/market_marquee');
    console.log("🔍 跑马灯原始数据:", res);
    
    // 辅助函数：安全提取数字
    const getPrice = (obj) => {
      if (!obj || !obj.price) return null;
      return parseFloat(String(obj.price).replace(/,/g, '')); // 去除逗号并转浮点数
    };
    
    const getChange = (obj) => {
      if (!obj || !obj.change) return 0;
      // 处理带 % 的字符串，如 "+0.85%" -> 0.85
      const val = parseFloat(String(obj.change).replace('%', ''));
      return isNaN(val) ? 0 : val;
    };

    const mapped = [];

    // 尝试提取纳指
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

    // 尝试提取 A50
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

    // 尝试提取上证
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
