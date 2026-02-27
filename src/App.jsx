import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './App.css';
import './index.css';

import SideNav from './components/SideNav';
import CyberSearch from './components/CyberSearch';
import GlobalLoading from './components/GlobalLoading';

import DiagnosisPage from './pages/DiagnosisPage';
import StrategyPage from './pages/StrategyPage';
import VipPage from './pages/VipPage';
import SettingsPage from './pages/SettingsPage';
import AdminPanel from './pages/AdminPanel';

import UserCenterModal from './components/UserCenterModal';
import LoginModal from './components/LoginModal';
import PaymentModal from './components/PaymentModal';

import { getQuote } from './api/stock';
import { useStockData } from './hooks/useStockData';
import MarketTicker from './components/MarketTicker';

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
        <div className="app-shell">
          <SideNav />
          <div className="app-main">
            <header className="top-bar">
              <div className="top-bar__brand">
                <div className="brand-title">AI 决策终端</div>
                <div className="brand-subtitle">保姆级决策</div>
              </div>
              <div className="top-bar__ticker">
                <MarketTicker />
              </div>
              <div className="top-bar__right">
                <div className="data-status">
                  <div className="status-dot online" title="数据连接正常"></div>
                </div>
                <button
                  className="user-center-button"
                  onClick={() => isLoggedIn ? setShowUserCenter(true) : setLoginModalVisible(true)}
                >
                  {isLoggedIn ? '个人中心' : '登录'}
                </button>
              </div>
            </header>


            <main className="content-area">
              <Routes>
                <Route
                  path="/"
                  element={(
                    <DiagnosisPage
                      stockData={stockData}
                      previousStockData={previousStockData}
                      loading={loading || multiLoading}
                      error={error}
                      marketStatus={marketStatus}
                      lastUpdate={lastUpdate}
                      autoRefreshEnabled={autoRefreshEnabled}
                      refreshInterval={refreshInterval}
                      onToggleAutoRefresh={toggleAutoRefresh}
                      onManualRefresh={handleManualRefresh}
                      onIntervalChange={handleIntervalChange}
                      onMarketStatusChange={handleMarketStatusChange}
                      onSearch={handleSearch}
                      searchLoading={multiLoading || loading}
                      currentStockCode={currentStockCode}
                      stockList={stockList}
                      isVip={isVip}

                    />
                  )}
                />
                <Route path="/strategy" element={<StrategyPage />} />
                <Route path="/vip" element={<VipPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
          </div>
          <div className="footer-risk-reminder">
            意见反馈:cuba@88.com
          </div>
        </div>
        <GlobalLoading visible={(loading || multiLoading) && !stockData} text="正在获取行情数据..." />
        
        {/* 登录弹窗 */}
        <LoginModal
          visible={loginModalVisible}
          onClose={() => setLoginModalVisible(false)}
          onLogin={handleLogin}
        />
        
        {/* 个人中心弹窗 */}
        <UserCenterModal
          visible={showUserCenter}
          onClose={() => setShowUserCenter(false)}
          userInfo={userInfo}
        />
        
        {/* 支付弹窗 */}
        <PaymentModal
          visible={paymentModalVisible}
          onClose={() => setPaymentModalVisible(false)}
          onSuccess={handlePayment}
        />
      </Router>
    </ConfigProvider>
  );
}

export default App;
