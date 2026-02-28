import React, { useState } from 'react';
import KLineChart from '../components/KLineChart';

const DiagnosisPage = () => {
  const [searchCode, setSearchCode] = useState('');
  
  // 模拟数据
  const currentStock = { 
    code: '600519', name: '贵州茅台', price: 1685.20, change: '+2.45%'
  };

  const dimensions = [
    { title: '基本面', icon: '📊', desc: '财务报表与盈利能力' },
    { title: '技术面', icon: '📈', desc: '量价形态与指标共振' },
    { title: '资金流向', icon: '💰', desc: '主力机构席位跟踪' },
    { title: '市场情绪', icon: '🔥', desc: '热点题材热度分析' },
    { title: '宏观政策', icon: '🏛️', desc: '行业导向影响评级' },
    { title: '外围影响', icon: '🌍', desc: '全球市场联动对冲' },
    { title: '风险探测', icon: '⚠️', desc: '股权质押等隐患预警' },
    { title: '综合结论', icon: '🧠', desc: 'AI全维度最终建议' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      
      {/* 1. 一键诊股入口 */}
      <section className="bg-white/70 backdrop-blur-md rounded-[2rem] p-8 border border-slate-200 shadow-sm flex flex-col items-center">
        <div className="w-full max-w-2xl flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <input 
            className="flex-1 bg-transparent px-6 outline-none text-slate-700 font-bold" 
            placeholder="输入股票代码/名称..." 
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
          <button className="bg-[#4e4376] text-white px-8 py-3 rounded-xl font-black shadow-lg active:scale-95 transition-all">GO</button>
        </div>
      </section>

      {/* 2. 【找回的部分】K线与盘口数据 */}
      <div className="grid grid-cols-12 gap-6 h-[480px]">
        {/* K线图区域 - 强化边界 */}
        <div className="col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-xl font-black text-slate-800">
              {currentStock.name} <span className="text-xs font-mono text-slate-400 ml-2">{currentStock.code}</span>
            </span>
            <div className="flex bg-white p-1 rounded-lg border border-slate-200">
              {['分时', '日K', '周K'].map(t => (
                <button key={t} className={`px-4 py-1 text-xs rounded ${t==='日K'?'bg-[#4e4376] text-white font-bold':'text-slate-400'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 p-4 relative">
             <KLineChart symbol={currentStock.code} />
          </div>
        </div>

        {/* 盘口数据区域 - 强化边界 */}
        <div className="col-span-4 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">当前成交价</p>
           <h3 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter">¥{currentStock.price}</h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 mb-1 uppercase font-bold">当日涨跌</p>
                <p className="text-xl font-black text-red-500">{currentStock.change}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 mb-1 uppercase font-bold">成交金额</p>
                <p className="text-xl font-black text-slate-700">42.8亿</p>
              </div>
           </div>
        </div>
      </div>

      {/* 3. 8维卡片矩阵 - 强化边缘(border-slate-200) */}
      <section className="grid grid-cols-4 gap-6">
        {dimensions.map((d, i) => (
          <div key={i} className="group relative aspect-square bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 hover:bg-white hover:-translate-y-2 transition-all duration-500 flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-md">{d.icon}</div>
            <h4 className="font-black text-slate-700 text-lg mb-1">{d.title}</h4>
            <p className="text-[10px] text-slate-400 leading-tight opacity-60 group-hover:opacity-100">{d.desc}</p>
            <div className="w-6 h-1 bg-slate-200 rounded-full mt-4 group-hover:w-12 group-hover:bg-[#4e4376] transition-all"></div>
          </div>
        ))}
      </section>

      {/* 4. 底部决策条 - 全部改为中文 */}
      <section className="bg-gradient-to-r from-[#2b5876] to-[#4e4376] rounded-[2.5rem] p-10 text-white shadow-2xl flex items-center justify-between relative overflow-hidden border border-white/10">
        <div className="flex items-center gap-10 relative z-10">
          <div className="text-center border-r border-white/20 pr-10">
            <p className="text-[10px] font-bold text-blue-300 tracking-widest mb-1">AI 综合评分</p>
            <p className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200">92</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl font-black flex items-center gap-3">建议积极买入 <span className="text-blue-300 text-sm font-light">高确定性机会</span></h4>
            <p className="text-blue-100/60 text-xs max-w-xl italic">
              综合多维深度数据，AI 检测到机构主力正在关键支撑位构建底仓，技术面呈现多头排列，建议择机入场。
            </p>
          </div>
        </div>
        <div className="text-4xl font-black text-white/10 absolute right-10 top-1/2 -translate-y-1/2">TRADE</div>
      </section>
    </div>
  );
};

export default DiagnosisPage;