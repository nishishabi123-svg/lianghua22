import { useStockData } from '../hooks/useStockData';
import React, { useState, useMemo } from 'react';
// 请确保这些路径正确，如果没有对应文件，请先创建或使用占位符
import SideNav from '../components/SideNav'; 
import MarketTicker from '../components/MarketTicker'; // 需确保此组件支持自定义宽度
import CyberSearch from '../components/CyberSearch';
import KLineChart from '../components/KLineChart';
import AIMultiDimensionAnalysis from '../components/AIMultiDimensionAnalysis';

// --- 模拟数据 (实际应从 API 获取) ---
const HOT_SECTORS_UP = [
  { name: '半导体', change: '+1.85%', leader: '中芯国际' },
  { name: '人工智能', change: '+1.42%', leader: '科大讯飞' },
  { name: '新能源', change: '+0.98%', leader: '宁德时代' },
  { name: '医药生物', change: '+0.75%', leader: '恒瑞医药' },
];

const HOT_SECTORS_DOWN = [
  { name: '房地产', change: '-1.20%', leader: '万科 A' },
  { name: '银行', change: '-0.85%', leader: '招商银行' },
  { name: '钢铁', change: '-0.60%', leader: '宝钢股份' },
  { name: '煤炭', change: '-0.45%', leader: '中国神华' },
];

const DiagnosisPage = () => {
  const [searchCode, setSearchCode] = useState('');
  
  // ✅ 新增：引入并调用 Hook
  const { 
    stockData, 
    loading, 
    error, 
    currentStockCode, 
    setStockCode,
    manualRefresh 
  } = useStockData(4000);

  // ✅ 新增：准备展示数据 (优先用实时数据)
  const currentStock = stockData || { 
    code: '000001', 
    name: '平安银行', 
    price: 10.50, 
    change: '+0.5%' 
  };
  

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* 1. 左侧侧边栏 (固定宽度) */}
      <aside className="w-64 bg-white border-r border-sky-100 shadow-sm z-20 flex-shrink-0">
        <SideNav /> 
      </aside>

      {/* 主体内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. 顶部导航栏 (天蓝渐变) */}
        <header className="h-20 bg-gradient-to-r from-sky-500 to-blue-600 shadow-md flex items-center px-6 flex-shrink-0">
          {/* 左侧：Logo 区域 (预留空间给侧边栏对齐) */}
          <div className="w-64 flex-shrink-0 flex flex-col justify-center">
            <h1 className="text-xl font-bold text-white tracking-wide">牛消息 AI 系统</h1>
            <p className="text-xs text-sky-100 opacity-90 mt-0.5">智能分析 · 辅助决策</p>
          </div>

          {/* 中间：大盘跑马灯 (占据剩余所有空间) */}
          <div className="flex-1 mx-6 overflow-hidden">
            <MarketTicker /> 
            {/* 注意：请确保 MarketTicker 组件内部样式设置为 width: 100% */}
          </div>

          {/* 右侧：用户中心 */}
          <div className="w-48 flex-shrink-0 flex justify-end">
            <button className="px-5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
              <span>👤</span> 登录 / 个人中心
            </button>
          </div>
        </header>

        {/* 滚动内容区 */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* 3. 核心搜索区 (C 位) */}
            <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-500"></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">输入代码，立即获取 AI 决策</h2>
              <div className="w-full max-w-2xl flex gap-3">
                <input 
                  type="text" 
                  placeholder="请输入股票代码或名称 (如：600519)" 
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-sky-100 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none text-lg transition-all"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                />
                <button className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg">
                  立即诊断
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-400">支持沪深 A 股、港股、美股 · 毫秒级响应</p>
            </section>

            {/* 4. 市场与 K 线分屏区 (7:3) */}
            <section className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-auto lg:h-[500px]">
              
              {/* 左侧：K 线图 (70%) */}
              <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-sky-100 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-sky-50 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{currentStock.name} <span className="text-gray-500 text-base font-normal">({currentStock.code})</span></h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-2xl font-bold text-gray-900">¥{currentStock.price}</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-sm font-bold">{currentStock.change}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['分时', '10 日', '日 K', '周 K'].map((tab) => (
                      <button key={tab} className="px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-sky-50 text-gray-600 hover:text-sky-600 transition-colors">
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 p-4 bg-white">
                  {/* 这里放入你的 K 线组件 */}
                  <KLineChart symbol={currentStock.code} height="100%" />
                  {/* 如果没有组件，显示占位符 */}
                  {/* <div className="w-full h-full flex items-center justify-center text-gray-400 bg-slate-50 rounded-lg">K 线图表区域</div> */}
                </div>
              </div>

              {/* 右侧：热门板块 (30%) - 正方形卡片两排 */}
              <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto no-scrollbar">
                
                {/* 上排：涨幅榜 */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-sky-100 p-4 flex flex-col">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-red-500 rounded-full"></span> 涨幅榜
                  </h4>
                  <div className="grid grid-cols-2 gap-3 content-start">
                    {HOT_SECTORS_UP.map((sector, idx) => (
                      <div key={idx} className="bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl p-3 cursor-pointer transition-all group">
                        <div className="text-xs text-gray-500 mb-1">{sector.name}</div>
                        <div className="text-lg font-bold text-red-600 mb-1">{sector.change}</div>
                        <div className="text-xs text-gray-400 truncate group-hover:text-red-500">龙头：{sector.leader}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 下排：跌幅榜 */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-sky-100 p-4 flex flex-col">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-green-500 rounded-full"></span> 跌幅榜
                  </h4>
                  <div className="grid grid-cols-2 gap-3 content-start">
                    {HOT_SECTORS_DOWN.map((sector, idx) => (
                      <div key={idx} className="bg-green-50 hover:bg-green-100 border border-green-100 rounded-xl p-3 cursor-pointer transition-all group">
                        <div className="text-xs text-gray-500 mb-1">{sector.name}</div>
                        <div className="text-lg font-bold text-green-600 mb-1">{sector.change}</div>
                        <div className="text-xs text-gray-400 truncate group-hover:text-green-500">龙头：{sector.leader}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </section>

            {/* 5. AI 多维度分析区 (扑克牌布局) */}
            <section>
              <AIMultiDimensionAnalysis />
            </section>

            {/* 底部 */}
            <footer className="text-center text-xs text-gray-400 py-6 border-t border-sky-100 mt-8">
              风险提示：AI 分析仅供参考，不构成投资建议 · 市场有风险，投资需谨慎
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
};

export default DiagnosisPage;