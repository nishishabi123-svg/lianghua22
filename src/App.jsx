import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './App.css';
import './index.css';

// 引入核心组件
import SideNav from './components/SideNav';
import MarketTicker from './components/MarketTicker';
import DiagnosisPage from './pages/DiagnosisPage'; // 确保路径正确
import StrategyPage from './pages/StrategyPage';

function App() {
  // 【关键操作】这里删掉了所有 useStockData 相关的代码
  
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="flex h-screen bg-[#f8fafd]">
          <SideNav />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 顶部状态栏 */}
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
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Live Connected</span>
                </div>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-600/20">
                  登录中心
                </button>
              </div>
            </header>

            {/* 内容区 */}
            <main className="flex-1 overflow-y-auto bg-[#f8fafd]">
              <div className="max-w-[1600px] mx-auto p-6">
                <Routes>
                  {/* 【关键操作】不再传递 stockData 这种过期的 props */}
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