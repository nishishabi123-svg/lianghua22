import React, { useState } from 'react';
import { useStockData } from '../hooks/useStockData';
import KLineChart from '../components/KLineChart';
import AIMultiDimensionAnalysis from '../components/AIMultiDimensionAnalysis';

const DiagnosisPage = ({ stockData, loading }) => {
  const [searchCode, setSearchCode] = useState('');
  
  // 优先使用父组件传下来的实时数据，如果没有则显示默认
  const currentStock = stockData || { 
    code: '600519', 
    name: '贵州茅台', 
    price: 1685.20, 
    change: '+2.45%',
    turnover: '0.32%',
    amount: '42.8亿'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. 核心搜索区 - 首页主入口 */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-sky-400"></div>
        <h2 className="text-2xl font-black text-gray-800 mb-6">智能个股分析中心</h2>
        <div className="w-full max-w-3xl flex gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 shadow-inner">
          <input 
            type="text" 
            placeholder="输入股票代码或名称，开启 AI 深度分析..." 
            className="flex-1 bg-transparent px-6 py-3 outline-none text-lg"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
          <button className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center gap-2">
            <span>⚡</span> 开始分析
          </button>
        </div>
      </section>

      {/* 2. K 线与实时信息分屏区 */}
      <section className="grid grid-cols-12 gap-6 h-[500px]">
        {/* 左侧：K 线图 (8格) */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black text-gray-800">{currentStock.name}</h3>
              <span className="text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">{currentStock.code}</span>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {['分时', '日K', '周K'].map(t => (
                <button key={t} className={`px-4 py-1 text-sm rounded-md ${t==='日K'?'bg-white shadow-sm font-bold text-blue-600':'text-gray-500'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-gray-900 m-4 rounded-xl relative">
             <KLineChart symbol={currentStock.code} />
             {loading && <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center text-white">加载数据中...</div>}
          </div>
        </div>

        {/* 右侧：实时数据卡片 (4格) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-700 mb-6 flex items-center justify-between">
            <span>实时盘口数据</span>
            <span className="animate-pulse text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full font-bold uppercase">Live</span>
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-gray-400 text-sm">当前成交价</span>
              <span className={`text-5xl font-black ${currentStock.change.includes('+') ? 'text-red-500' : 'text-green-500'}`}>
                {currentStock.price}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">今日涨跌幅</div>
                <div className={`text-xl font-bold ${currentStock.change.includes('+') ? 'text-red-500' : 'text-green-500'}`}>{currentStock.change}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">成交额</div>
                <div className="text-xl font-bold text-gray-800">{currentStock.amount}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">换手率</div>
                <div className="text-xl font-bold text-gray-800">{currentStock.turnover}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-xs text-gray-400 mb-1">市盈率(T)</div>
                <div className="text-xl font-bold text-gray-800">28.4</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AI 6 维度分析区 */}
      <section className="py-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
          AI 多维度深度诊断
        </h3>
        <AIMultiDimensionAnalysis /> {/* 确保这个组件内部渲染两排共6个卡片 */}
      </section>

      {/* 4. 最终 AI 决策长条 (醒目、包含打分) */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-8 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="flex flex-col items-center border-r border-white/10 pr-10">
            <span className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">AI 综合评分</span>
            <div className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-400">92</div>
            <div className="text-xs text-blue-400 mt-2">Beat 95% Stocks</div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded animate-pulse">最终决策建议</span>
              <h4 className="text-4xl font-black text-yellow-400">强力建议买入 (Strong Buy)</h4>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-3xl border-l-2 border-blue-500/50 pl-4 italic">
              基于 6 维模型综合评估：主力资金已完成箱体吸筹，配合技术面空中加油形态，且所属行业处于政策利好周期。建议在 1680 支撑线附近积极建仓，盈亏比极高。
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95">
              立即加仓跟踪
            </button>
            <button className="text-gray-400 text-sm hover:text-white transition-colors">下载详细分析报告 .PDF</button>
          </div>
        </div>
      </section>

      <footer className="text-center text-xs text-gray-400 py-10">
        © 2024 AI 智投系统 · 投资有风险 决策需谨慎
      </footer>
    </div>
  );
};

export default DiagnosisPage;