import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './App.css';
import './index.css';

import SideNav from './components/SideNav';
import MarketTicker from './components/MarketTicker';
import DiagnosisPage from './pages/DiagnosisPage';
import StrategyPage from './pages/StrategyPage';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="flex h-screen bg-[#f8fafd] overflow-hidden">
          <div style={{ width: '260px', minWidth: '260px', flexShrink: 0 }}>
            <SideNav />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
            <header className="h-20 bg-white border-b flex items-center px-8 justify-between">
              <div className="flex-1 max-w-4xl">
                <MarketTicker />
              </div>
              <div className="flex items-center gap-6 ml-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Live Data</span>
                </div>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-600/20">
                  登录中心
                </button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-[#f8fafd] p-6">
              <div className="max-w-[1400px] mx-auto">
                <Routes>
                  <Route path="/" element={<DiagnosisPage />} />
                  <Route path="/strategy" element={<StrategyPage />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;