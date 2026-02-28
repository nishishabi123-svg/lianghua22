import React, { useState, useEffect, useCallback } from 'react';
import KLineChart from '../components/KLineChart';

const DiagnosisPage = () => {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 初始数据状态
  const [stockData, setStockData] = useState({
    name: '平安银行',
    symbol: '000001',
    price: '0.00',
    change: '0.00%',
    score: 0,
    summary: '等待数据加载...',
    decisions: {} 
  });

  // 确认为 9000 端口
  const BEIJING_SERVER = "http://82.157.126.222:9000";

  const dimensionMap = [
    { key: 'fundamental', title: '基本面', icon: '📊' },
    { key: 'technical', title: '技术面', icon: '📈' },
    { key: 'capital', title: '资金流向', icon: '💰' },
    { key: 'sentiment', title: '市场情绪', icon: '🔥' },
    { key: 'policy', title: '宏观政策', icon: '🏛️' },
    { key: 'external', title: '外围影响', icon: '🌍' },
    { key: 'risk', title: '风险探测', icon: '⚠️' },
    { key: 'conclusion', title: '综合结论', icon: '🧠' },
  ];

  const triggerDiagnosis = useCallback(async (target) => {
    const code = target || searchSymbol;
    if (!code) return;
    
    setLoading(true);
    try {
      // 重要：根据你后端 main.py 第382行，参数必须是 code
      const response = await fetch(`${BEIJING_SERVER}/api/stock_decision?code=${code}`);
      const result = await response.json();

      if (result.status === 'success' && result.data) {
        const d = result.data;
        const base = d.base_info || {};
        const ai = d.ai_analysis || {};

        setStockData({
          name: base.name || '未知',
          symbol: base.code || base.symbol || code,
          // 容错处理：尝试多种可能的成交价字段名
          price: base.price || base.current || '0.00',
          // 容错处理：尝试多种涨跌幅字段名
          change: base.change_pct || base.change || '0.00%',
          score: ai.score || 0,
          summary: ai.summary || '暂无诊断摘要',
          decisions: ai.decision || {} 
        });
      }
    } catch (error) {
      console.error("无法连接北京服务器，请检查后端 9000 端口是否开放:", error);
    } finally {
      setLoading(false);
    }
  }, [searchSymbol]);

  useEffect(() => {
    triggerDiagnosis('000001');
  }, []);

  return (
    <div className="space-y-6 pb-20 px-4 md:px-0">
      
      {/* 搜索区 */}
      <section className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col items-center">
        <div className="w-full max-w-2xl flex p-1.5 bg-slate-100 rounded-2xl border border-slate-300">
          <input 
            className="flex-1 bg-transparent px-6 outline-none text-slate-700 font-bold" 
            placeholder="输入代码 (如: 000001)" 
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && triggerDiagnosis()}
          />
          <button 
            onClick={() => triggerDiagnosis()}
            disabled={loading}
            className="bg-[#4e4376] text-white px-8 py-3 rounded-xl font-black transition-all active:scale-95"
          >
            {loading ? '...' : 'GO'}
          </button>
        </div>
      </section>

      {/* K线与数据 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-800">{stockData.name}</span>
              <span className="text-sm font-mono text-slate-400">{stockData.symbol}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               <span className="text-[10px] font-bold text-green-700 uppercase">Live</span>
            </div>
          </div>
          <div className="flex-1 bg-white">
             {/* 这里的 KLineChart 如果还是不出图，说明其内部代码也需要修改端口 */}
             <KLineChart symbol={stockData.symbol} />
          </div>
        </div>

        <div className="col-span-1 md:col-span-4 bg-white rounded-[2rem] border border-slate-300 p-8 flex flex-col justify-center">
           <p className="text-[10px] font-bold text-slate-400 tracking-widest mb-1">REAL-TIME PRICE</p>
           <h3 className="text-6xl font-black text-slate-900 mb-6 font-mono tracking-tighter italic">
             <small className="text-2xl not-italic mr-1 text-slate-400">¥</small>{stockData.price}
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-400 mb-1 font-bold">当日涨跌</p>
                <p className={`text-xl font-black ${stockData.change.toString().includes('+') || parseFloat(stockData.change) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {stockData.change}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-400 mb-1 font-bold">AI 评分</p>
                <p className="text-xl font-black text-[#4e4376]">{stockData.score}</p>
              </div>
           </div>
        </div>
      </div>

      {/* 8维分析卡片 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {dimensionMap.map((d, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-slate-300 flex flex-col items-center text-center shadow-sm">
            <div className="text-4xl mb-3">{d.icon}</div>
            <h4 className="font-black text-slate-700 text-sm md:text-lg mb-2">{d.title}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-4">
              {stockData.decisions[d.key] || "等待实时诊断..."}
            </p>
          </div>
        ))}
      </section>

      {/* 底部条 */}
      <section className="bg-gradient-to-r from-[#2b5876] to-[#4e4376] rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="text-center md:border-r border-white/20 md:pr-10">
            <p className="text-[10px] font-bold text-blue-300 mb-1 uppercase">Final Score</p>
            <p className="text-7xl font-black italic">{stockData.score}</p>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-3xl font-black">AI 诊断摘要</h4>
            <p className="text-blue-100/60 text-xs md:text-sm max-w-2xl italic leading-relaxed">
              {stockData.summary}
            </p>
          </div>
        </div>
        <button 
          onClick={() => window.open(`${BEIJING_SERVER}/api/stock_full_report?symbol=${stockData.symbol}`)}
          className="mt-6 md:mt-0 bg-white text-[#4e4376] px-10 py-5 rounded-2xl font-black shadow-xl"
        >
           生成报告
        </button>
      </section>
    </div>
  );
};

export default DiagnosisPage;