import MarketTicker from './components/MarketTicker';
// 确保 DiagnosisPage 是从正确路径引入的
import DiagnosisPage from './pages/DiagnosisPage';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './App.css';
import './index.css';

import SideNav from './components/SideNav';
import CyberSearch from './components/CyberSearch';
import GlobalLoading from './components/GlobalLoading';

import StrategyPage from './pages/StrategyPage';
import VipPage from './pages/VipPage';
import SettingsPage from './pages/SettingsPage';
import AdminPanel from './pages/AdminPanel';

import UserCenterModal from './components/UserCenterModal';
import LoginModal from './components/LoginModal';
import PaymentModal from './components/PaymentModal';

import { getQuote } from './api/stock';
import { useStockData } from './hooks/useStockData';

function App() {
  const {
    stockData,
    previousStockData,
    loading,
    error,
    isMarketOpen,
    currentStockCode,
    setStockCode,
    setAutoRefresh,
    manualRefresh
  } = useStockData(4000);

  const [refreshInterval, setRefreshInterval] = useState(4000);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [marketStatus, setMarketStatus] = useState({
    isMarketOpen: true,
    phase: 'open',
    beijingTime: new Date()
  });
  const [lastUpdate, setLastUpdate] = useState(null);
  const [stockList, setStockList] = useState([]);
  const [multiLoading, setMultiLoading] = useState(false);
  const [isVip] = useState(false);
  const [showUserCenter, setShowUserCenter] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '游客用户',
    level: 'guest',
    dailyLimit: 1,
    usedCount: 0,
    monthlyUsed: 0,
    totalUsed: 0,
    registerTime: '2024-01-01',
    expireTime: '永久有效'
  });
  const multiRefreshRef = useRef(null);

  const handleLogin = (userData) => {
    setUserInfo(userData);
    setIsLoggedIn(true);
    setIsVip(userData.level !== 'guest');
  };

  const handlePayment = (paymentData) => {
    // 更新用户状态为付费会员
    setUserInfo(prev => ({
      ...prev,
      level: 'premium',
      dailyLimit: 10,
      expireTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    }));
    setIsVip(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo({
      name: '游客用户',
      level: 'guest',
      dailyLimit: 1,
      usedCount: 0,
      monthlyUsed: 0,
      totalUsed: 0,
      registerTime: '2024-01-01',
      expireTime: '永久有效'
    });
    setIsVip(false);
  };

  const isSameQuote = useCallback((prev, next) => {
    return (
      prev?.price === next?.price &&
      prev?.change === next?.change &&
      prev?.amount === next?.amount &&
      prev?.turnover_rate === next?.turnover_rate
    );
  }, []);

  const refreshStockList = useCallback(() => {
    if (!stockList.length) return;
    const codes = stockList.map((item) => item.code).filter(Boolean);
    if (!codes.length) return;

    Promise.all(codes.map((code) => getQuote(code)))
      .then((results) => {
        const resultMap = new Map(results.filter(Boolean).map((item) => [item.code, item]));
        setStockList((prev) =>
          prev.map((item) => {
            const next = resultMap.get(item.code);
            if (!next) return item;
            return isSameQuote(item, next) ? item : { ...item, ...next };
          })
        );
      })
      .catch((err) => {
        console.error('静默刷新失败:', err);
      });
  }, [isSameQuote, stockList]);

  const handleSearch = useCallback((codes) => {
    if (!codes || codes.length === 0) return;

    setMultiLoading(true);
    Promise.all(codes.map((code) => getQuote(code)))
      .then((results) => {
        const cleaned = results.filter((item) => item && item.code);
        setStockList(cleaned);
        if (cleaned[0]) {
          setStockCode(cleaned[0].code);
          setAutoRefreshEnabled(true);
          setLastUpdate(new Date());
        }
      })
      .catch((err) => {
        console.error('批量查询失败:', err);
      })
      .finally(() => {
        setMultiLoading(false);
      });
  }, [setAutoRefreshEnabled, setStockCode]);

  const handleManualRefresh = useCallback(() => {
    manualRefresh();
    setLastUpdate(new Date());
  }, [manualRefresh]);

  const toggleAutoRefresh = useCallback(() => {
    const newStatus = !autoRefreshEnabled;
    setAutoRefreshEnabled(newStatus);
    setAutoRefresh(newStatus, refreshInterval);
  }, [autoRefreshEnabled, setAutoRefresh, refreshInterval]);

  const handleIntervalChange = useCallback((newInterval) => {
    setRefreshInterval(newInterval);
    if (autoRefreshEnabled) {
      setAutoRefresh(true, newInterval);
    }
  }, [autoRefreshEnabled, setAutoRefresh]);

  const handleMarketStatusChange = useCallback((status) => {
    setMarketStatus(status);

    if (status.isMarketOpen) {
      if (autoRefreshEnabled) {
        setAutoRefresh(true, refreshInterval);
      }
    } else {
      setAutoRefresh(false);
    }
  }, [autoRefreshEnabled, refreshInterval, setAutoRefresh]);

  useEffect(() => {
    if (currentStockCode && isMarketOpen) {
      setAutoRefresh(true, refreshInterval);
    } else {
      setAutoRefresh(false);
    }
  }, [currentStockCode, isMarketOpen, refreshInterval, setAutoRefresh]);

  useEffect(() => {
    if (stockData) {
      setLastUpdate(new Date());
      setStockList((prev) =>
        prev.map((item) => (item.code === stockData.code ? { ...item, ...stockData } : item))
      );
    }
  }, [stockData]);

  useEffect(() => {
    if (multiRefreshRef.current) {
      clearInterval(multiRefreshRef.current);
      multiRefreshRef.current = null;
    }

    if (autoRefreshEnabled && marketStatus.isMarketOpen && stockList.length) {
      multiRefreshRef.current = setInterval(() => {
        refreshStockList();
      }, refreshInterval);
    }

    return () => {
      if (multiRefreshRef.current) {
        clearInterval(multiRefreshRef.current);
        multiRefreshRef.current = null;
      }
    };
  }, [autoRefreshEnabled, marketStatus.isMarketOpen, refreshInterval, refreshStockList, stockList.length]);

  return (
<ConfigProvider locale={zhCN}>
      <Router>
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
          <aside className="w-64 flex-shrink-0 z-20 shadow-2xl">
            <SideNav />
          </aside>

          <div className="flex-1 flex flex-col min-w-0">
            {/* 科技感 Header */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-8 z-10 justify-between">
              <div className="flex-1 max-w-4xl">
                <MarketTicker /> 
              </div>
              
              <div className="flex items-center gap-6 ml-6">
                {/* 状态呼吸灯 */}
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Live Data</span>
                </div>
                
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                  登录中心
                </button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-[#f8fafd]">
              <div className="max-w-[1600px] mx-auto p-6">
                <Routes>
                  <Route path="/" element={<DiagnosisPage stockData={stockData} loading={loading} />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </ConfigProvider>
    
     }

export default App;
