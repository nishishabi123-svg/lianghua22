import React, { useState } from 'react';
import KLineChart from '../components/KLineChart';

const DiagnosisPage = () => {
  const dimensions = [
    { title: '基本面', icon: '📊', desc: '财务报表与盈利能力深度解析' },
    { title: '技术面', icon: '📈', desc: '量价形态与多周期指标共振' },
    { title: '资金流向', icon: '💰', desc: '北向资金与主力机构席位跟踪' },
    { title: '市场情绪', icon: '🔥', desc: '涨跌家数比与热点题材热度' },
    { title: '宏观政策', icon: '🏛️', desc: '行业导向与货币政策影响评级' },
    { title: '外围影响', icon: '🌍', desc: '美股联动与汇率波动对冲分析' },
    { title: '风险探测', icon: '⚠️', desc: '商誉减值、股权质押等隐患预警' },
    { title: '综合结论', icon: '🧠', desc: 'AI全维度加权最终投资建议' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* 搜索区：改为磨砂质感 */}
      <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 border border-white shadow-sm flex flex-col items-center">
        <div className="w-full max-w-2xl flex p-2 bg-slate-200/50 rounded-2xl border border-slate-200 focus-within:border-blue-400 transition-all">
          <input className="flex-1 bg-transparent px-6 outline-none text-slate-700 font-bold" placeholder="输入股票名称/代码..." />
          <button className="bg-[#4e4376] text-white px-8 py-3 rounded-xl font-black shadow-lg hover:shadow-blue-900/20 active:scale-95 transition-all">GO</button>
        </div>
      </section>

      {/* 8维卡片：这是重点优化的朦胧感部分 */}
      <section className="grid grid-cols-4 gap-6">
        {dimensions.map((d, i) => (
          <div key={i} className="group relative aspect-square bg-white/40 backdrop-blur-lg p-8 rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(78,67,118,0.15)] hover:bg-white/80 hover:-translate-y-2 transition-all duration-500 flex flex-col items-center justify-center text-center">
            {/* 卡片背景微光 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-[2.5rem] pointer-events-none"></div>
            
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform drop-shadow-sm">{d.icon}</div>
            <h4 className="font-black text-slate-700 text-lg mb-2">{d.title}</h4>
            <p className="text-[10px] text-slate-400 px-4 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">{d.desc}</p>
            
            <div className="w-6 h-1 bg-slate-200 rounded-full mt-4 group-hover:w-12 group-hover:bg-[#4e4376] transition-all"></div>
          </div>
        ))}
      </section>

      {/* 底部决策条：色彩调和 */}
      <section className="bg-gradient-to-r from-[#2b5876] to-[#4e4376] rounded-[3rem] p-10 text-white shadow-2xl flex items-center justify-between relative overflow-hidden border border-white/10">
        <div className="flex items-center gap-10 relative z-10">
          <div className="text-center border-r border-white/20 pr-10">
            <p className="text-[10px] font-bold text-blue-300 tracking-widest uppercase mb-1">AI Power Score</p>
            <p className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200">92</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl font-black flex items-center gap-3">建议积极买入 <span className="text-blue-300 text-sm font-light">Strong Buy Opinion</span></h4>
            <p className="text-blue-100/60 text-xs max-w-xl italic">综合 8 维全量原始数据，AI 探测到多头资金异动，配合技术指标低位金叉，建议于支撑位附近择机入场。</p>
          </div>
        </div>
        <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-5 rounded-2xl font-bold hover:bg-white hover:text-[#4e4376] transition-all shadow-xl active:scale-95">
           📄 生成深度诊断报告
        </button>
      </section>
    </div>
  );
};

export default DiagnosisPage;