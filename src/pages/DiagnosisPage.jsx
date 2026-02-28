import React, { useState } from 'react';
import KLineChart from '../components/KLineChart';

const DiagnosisPage = ({ stockData, loading }) => {
  const [searchCode, setSearchCode] = useState('');
  
  const currentStock = stockData || { 
    code: '600519', name: '贵州茅台', price: 1685.20, change: '+2.45%', amount: '42.8亿', turnover: '0.32%'
  };

  const dimensions = [
    { title: '基本面', icon: '📊', color: 'blue' },
    { title: '技术面', icon: '📈', color: 'indigo' },
    { title: '资金流向', icon: '💰', color: 'emerald' },
    { title: '市场情绪', icon: '🔥', color: 'orange' },
    { title: '宏观政策', icon: '🏛️', color: 'cyan' },
    { title: '外围影响', icon: '🌍', color: 'purple' },
    { title: '风险探测', icon: '⚠️', color: 'red' },
    { title: '综合结论', icon: '🧠', color: 'slate' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. 一键诊股入口 */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> 一键诊股
        </h2>
        <div className="w-full max-w-2xl flex gap-0 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <input 
            className="flex-1 bg-transparent px-6 py-4 outline-none text-lg font-medium" 
            placeholder="输入股票代码/名称..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white w-24 rounded-xl font-black text-xl transition-all shadow-lg active:scale-95">
            GO
          </button>
        </div>
      </section>

      {/* 2. K线与盘口 - 毛玻璃效果 */}
      <section className="grid grid-cols-12 gap-6 h-[520px]">
        <div className="col-span-8 bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <span className="text-2xl font-black">{currentStock.name}</span>
               <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-mono">{currentStock.code}</span>
             </div>
             <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
               {['分时', '日K', '周K'].map(t => <button key={t} className={`px-4 py-1.5 text-xs rounded-lg ${t==='日K'?'bg-white shadow-sm font-bold text-blue-600':'text-slate-500'}`}>{t}</button>)}
             </div>
          </div>
          <div className="flex-1 m-6 rounded-2xl bg-slate-50 border border-slate-100 relative overflow-hidden">
             <KLineChart symbol={currentStock.code} />
          </div>
        </div>

        <div className="col-span-4 bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-xl rounded-3xl border border-white shadow-xl p-8 flex flex-col justify-between">
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">实时盘口数据</h3>
          <div className="mt-4 flex flex-col">
            <span className="text-sm text-slate-400 mb-1">当前成交价</span>
            <span className="text-6xl font-black text-slate-900 tracking-tighter">¥{currentStock.price}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
             <div className="bg-white/50 p-4 rounded-2xl border border-white shadow-sm">
                <div className="text-[10px] text-slate-400 mb-1 uppercase">今日涨跌</div>
                <div className="text-xl font-black text-red-500">{currentStock.change}</div>
             </div>
             <div className="bg-white/50 p-4 rounded-2xl border border-white shadow-sm">
                <div className="text-[10px] text-slate-400 mb-1 uppercase">成交额</div>
                <div className="text-xl font-black text-slate-800">{currentStock.amount}</div>
             </div>
             <div className="bg-white/50 p-4 rounded-2xl border border-white shadow-sm">
                <div className="text-[10px] text-slate-400 mb-1 uppercase">换手率</div>
                <div className="text-xl font-black text-slate-800">{currentStock.turnover}</div>
             </div>
             <div className="bg-white/50 p-4 rounded-2xl border border-white shadow-sm">
                <div className="text-[10px] text-slate-400 mb-1 uppercase">市盈率(T)</div>
                <div className="text-xl font-black text-slate-800">28.42</div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. 8 维 AI 分析矩阵 */}
      <section className="grid grid-cols-4 gap-6">
        {dimensions.map((d, i) => (
          <div key={i} className="group bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-xl hover:bg-white hover:-translate-y-2 transition-all duration-500 aspect-square flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500">{d.icon}</div>
            <h4 className="font-black text-slate-800 text-lg mb-2">{d.title}</h4>
            <div className="w-8 h-1 bg-blue-500/20 rounded-full group-hover:w-16 group-hover:bg-blue-500 transition-all duration-500"></div>
            <p className="mt-4 text-xs text-slate-400 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">点击查看深度报告内容...</p>
          </div>
        ))}
      </section>

      {/* 4. 底部决策条 - 移除个股跟踪，保留报告按钮 */}
      <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px]"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-10">
            <div className="text-center border-r border-white/10 pr-10">
              <div className="text-[10px] text-blue-400 font-bold tracking-[0.2em] mb-2 uppercase">AI Score</div>
              <div className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-400 leading-none">92</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-600 rounded text-[10px] font-bold">终端建议</span>
                <h4 className="text-4xl font-black text-white italic">强力建议买入 <span className="text-blue-400">(Strong Buy)</span></h4>
              </div>
              <p className="text-slate-400 text-sm max-w-2xl italic">基于 8 维全量数据：该股处于上升通道底部，资金流向显示主力持续增仓，配合宏观政策面利好，诊断为高确定性机会。</p>
            </div>
          </div>
          
          <button className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl flex items-center gap-3 group">
            <span>📄</span> 一键生成诊断报告
            <span className="group-hover:translate-x-2 transition-transform">→</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default DiagnosisPage;