import React, { useState, useEffect } from 'react';
import KLineChart from '../components/KLineChart';

const DiagnosisPage = () => {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 默认初始状态
  const [stockData, setStockData] = useState({
    name: '平安银行',
    symbol: '000001',
    price: '--.--',
    change: '0.00%',
    score: 0,
    summary: '正在调取北京算力中心实时行情...',
    decisions: {} 
  });

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

  // 核心请求函数：支持外部传入 symbol
  const triggerDiagnosis = async (targetSymbol) => {
    const symbolToSearch = targetSymbol || searchSymbol;
    if (!symbolToSearch) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${BEIJING_SERVER}/api/stock_decision?symbol=${symbolToSearch}`);
      const result = await res.json();

      if (result.status === 'success') {
        const d = result.data;
        setStockData({
          name: d.base_info?.name || '未知股票',
          symbol: d.base_info?.symbol || symbolToSearch,
          price: d.base_info?.price || '0.00',
          change: d.base_info?.change_pct || '0.00%',
          score: d.ai_analysis?.score || 60,
          summary: d.ai_analysis?.summary || '分析完成。',
          decisions: d.ai_analysis?.decision || {} 
        });
      }
    } catch (error) {
      console.error("通讯异常:", error);
    } finally {
      setLoading(false);
    }
  };

  // 【新增】自动加载逻辑：页面打开时默认请求 000001
  useEffect(() => {
    triggerDiagnosis('000001');
  }, []); // 空依赖数组表示仅在组件挂载时运行一次

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-1000 px-4 md:px-0">
      
      {/* 1. 搜索区 */}
      <section className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col items-center">
        <div className="w-full max-w-2xl flex p-1.5 bg-slate-100 rounded-2xl border border-slate-300 focus-within:border-indigo-400 transition-all shadow-inner">
          <input 
            className="flex-1 bg-transparent px-6 outline-none text-slate-700 font-bold text-base placeholder:text-slate-400" 
            placeholder="输入股票代码 (如: 000001)" 
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && triggerDiagnosis()}
          />
          <button 
            onClick={() => triggerDiagnosis()}
            disabled={loading}
            className="bg-[#4e4376] text-white px-8 md:px-10 py-3 rounded-xl font-black text-xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? '分析中...' : 'GO'}
          </button>
        </div>
      </section>

      {/* 2. K线与盘口 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-800">{stockData.name}</span>
              <span className="px-3 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">{stockData.symbol}</span>
            </div>
            <div className="hidden md:flex gap-2 items-center text-[10px] font-bold text-green-600">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
               数据已同步北京算力中心
            </div>
          </div>
          <div className="flex-1 relative bg-[#fcfcfc]">
             <KLineChart symbol={stockData.symbol} />
             {loading && (
               <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-10 transition-all">
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-indigo-600 font-black text-xs">AI 深度扫描中</span>
                 </div>
               </div>
             )}
          </div>
        </div>

        <div className="col-span-1 md:col-span-4 bg-white rounded-[2rem] border border-slate-300 p-8 flex flex-col justify-center relative shadow-sm overflow-hidden">
           {/* 背景装饰 */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
           
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">CURRENT PRICE</p>
           <h3 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter italic">
             <small className="text-2xl not-italic mr-1 text-slate-400 font-light">¥</small>{stockData.price}
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-400 mb-1 font-bold">当日涨跌</p>
                <p className={`text-xl font-black ${stockData.change.includes('+') ? 'text-red-500' : 'text-green-600'}`}>
                  {stockData.change}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-400 mb-1 font-bold">AI 评级</p>
                <p className="text-xl font-black text-[#4e4376]">
                  {stockData.score >= 80 ? '增持' : stockData.score >= 50 ? '中性' : '规避'}
                </p>
              </div>
           </div>
        </div>
      </div>

      {/* 3. 8维卡片 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {dimensionMap.map((d, i) => (
          <div key={i} className="group aspect-square bg-white/40 backdrop-blur-lg p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-300 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 hover:bg-white hover:-translate-y-2 transition-all duration-500 flex flex-col items-center justify-center text-center">
            <div className="text-4xl md:text-5xl mb-4 group-hover:rotate-12 transition-transform drop-shadow-md">{d.icon}</div>
            <h4 className="font-black text-slate-700 text-sm md:text-lg mb-2">{d.title}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 md:line-clamp-none">
              {stockData.decisions[d.key] || "实时计算结果填充中..."}
            </p>
            <div className="hidden md:block w-6 h-1 bg-slate-200 rounded-full mt-4 group-hover:w-16 group-hover:bg-[#4e4376] transition-all"></div>
          </div>
        ))}
      </section>

      {/* 4. 底部决策条 */}
      <section className="bg-gradient-to-r from-[#2b5876] to-[#4e4376] rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden border border-white/10">
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="text-center md:border-r border-white/20 md:pr-10">
            <p className="text-[10px] font-bold text-blue-300 tracking-widest mb-1 uppercase">AI 综合评分</p>
            <p className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200">
              {stockData.score}
            </p>
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-3xl font-black flex items-center justify-center md:justify-start gap-3">
              建议：{stockData.score >= 80 ? '积极买入' : stockData.score >= 50 ? '谨慎持股' : '暂时观望'}
            </h4>
            <p className="text-blue-100/60 text-xs md:text-sm max-w-2xl leading-relaxed italic">
              {stockData.summary}
            </p>
          </div>
        </div>
        <button 
          onClick={() => window.open(`${BEIJING_SERVER}/api/stock_full_report?symbol=${stockData.symbol}`)}
          className="mt-6 md:mt-0 bg-white text-[#4e4376] px-10 py-5 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 relative z-10"
        >
           📄 查看完整分析报告
        </button>
      </section>
    </div>
  );
};

export default DiagnosisPage;