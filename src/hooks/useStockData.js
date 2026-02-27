import { useState, useCallback, useRef, useEffect } from 'react';
import { getQuote } from '../api/stock';

export const useStockData = (initialRefreshInterval = 4000) => {
  const [stockData, setStockData] = useState(null);
  const [previousStockData, setPreviousStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  
  const intervalRef = useRef(null);
  const currentStockCodeRef = useRef('');
  const lastUpdateTimeRef = useRef(0);

  // 检查市场是否开放
  const checkMarketStatus = useCallback(() => {
    const now = new Date();
    const beijingTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (8 * 3600000));
    const hour = beijingTime.getHours();
    const minute = beijingTime.getMinutes();
    const day = beijingTime.getDay();
    
    // 周末休市
    if (day === 0 || day === 6) {
      return false;
    }
    
    // A股交易时间: 9:30-11:30, 13:00-15:00
    const timeInMinutes = hour * 60 + minute;
    const isMorningSession = timeInMinutes >= 9 * 60 + 30 && timeInMinutes <= 11 * 60 + 30;
    const isAfternoonSession = timeInMinutes >= 13 * 60 && timeInMinutes <= 15 * 60;
    
    return isMorningSession || isAfternoonSession;
  }, []);

  // 获取股票数据
  const fetchStockData = useCallback(async (code) => {
    if (!code) return;
    
    // 防止重复请求
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 1000) {
      return;
    }
    
    setLoading(true);
    setError(null);
    lastUpdateTimeRef.current = now;
    
    try {
      const result = await getQuote(code);
      if (result && result.code) {
        setPreviousStockData(prev => 
          prev && prev.code === result.code ? prev : stockData
        );
        setStockData(result);
        currentStockCodeRef.current = result.code;
      }
    } catch (err) {
      console.error('获取股票数据失败:', err);
      setError(err.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [stockData]);

  // 静默刷新（不显示loading状态）
  const silentRefresh = useCallback(async (code) => {
    if (!code) return;
    
    try {
      const result = await getQuote(code);
      if (result && result.code) {
        setPreviousStockData(prev => 
          prev && prev.code === result.code ? prev : stockData
        );
        setStockData(result);
      }
    } catch (err) {
      console.error('静默刷新失败:', err);
    }
  }, [stockData]);

  // 设置自动刷新
  const setAutoRefresh = useCallback((enable, interval = initialRefreshInterval) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (enable && currentStockCodeRef.current && isMarketOpen) {
      intervalRef.current = setInterval(() => {
        const marketOpen = checkMarketStatus();
        if (marketOpen) {
          silentRefresh(currentStockCodeRef.current);
        } else {
          setIsMarketOpen(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, interval);
    }
  }, [silentRefresh, initialRefreshInterval, isMarketOpen, checkMarketStatus]);

  // 手动刷新
  const manualRefresh = useCallback(() => {
    if (currentStockCodeRef.current) {
      fetchStockData(currentStockCodeRef.current);
    }
  }, [fetchStockData]);

  // 设置股票代码
  const setStockCode = useCallback((code) => {
    if (code && code !== currentStockCodeRef.current) {
      fetchStockData(code);
    }
  }, [fetchStockData]);

  // 监控市场状态
  useEffect(() => {
    const marketStatus = checkMarketStatus();
    setIsMarketOpen(marketStatus);
    
    if (!marketStatus && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [checkMarketStatus]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    stockData,
    previousStockData,
    loading,
    error,
    isMarketOpen,
    currentStockCode: currentStockCodeRef.current,
    fetchStockData,
    setStockCode,
    setAutoRefresh,
    manualRefresh,
    checkMarketStatus
  };
};