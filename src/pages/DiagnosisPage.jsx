import React, { useState, useEffect, useCallback } from 'react';
import KLineChart from '../components/KLineChart';

const DiagnosisPage = () => {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 1. 初始数据状态 - 默认展示平安银行，避免空白
  const [stockData, setStockData] = useState({
    name: '平安银行',
    symbol: '000001',
    price: '10.25', // 预设一个基准值，防止渲染瞬间显示--
    change: '+0.00%',
    score: 85,
    summary: '系统已就绪，正在实时监控北京算力中心行情数据...',
    decisions: {
      fundamental: '核心利润稳健，资产质量优异。',
      technical: '均线多头排列，量价配合理想。',
      capital: '北向资金持续流入。',
      conclusion: '维持增持评级。'
    } 
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

  // 2. 核心请求逻辑 - 适配 symbol 参数名
  const triggerDiagnosis = useCallback(async (target) => {
    const symbol = target || searchSymbol;
    if (!symbol) return;
    
    setLoading(true);
    try {
      // 显式调用 9000 端口的决策摘要接口
      const response = await fetch(`${BEIJING_SERVER}/api/stock_decision?symbol=${symbol}`);
      const result = await response.json();

      if (result.status === 'success' && result.data) {
        const d = result.data;
        setStockData({
          name: d.base_info?.name || stockData.name,
          symbol: d.base_info?.symbol || symbol,
          price: d.base_info?.price || '0.00',
          // 后端返回的是 change_pct
          change: d.base_info?.change_pct || '0.00%',
          score: d.ai_analysis?.score || 60,
          summary: d.ai_analysis?.summary || '分析完成。',
          decisions: d.ai_analysis?.decision || {} 
        });
      }
    } catch (error) {
      console.error("北京服务器响应失败，请检查网络或端口:", error);
    } finally {
      setLoading(false);
    }
  }, [searchSymbol, BEIJING_SERVER]);

  // 3. 初始进入自动加载
  useEffect(() => {
    triggerDiagnosis('000001');
  }, []);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 px-4 md:px-0">
      
      {/* 搜索区 */}
      <section className="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col items-center">
        <div className="w-full max-w-2xl flex p-1.5 bg-slate-100 rounded-2xl border border-slate-300 focus-within:border-[#4e4376] transition-all shadow-inner">
          <input 
            className="flex-1 bg-transparent px-6 outline-none text-slate-700 font-bold text-base" 
            placeholder="输入代码 (如: 000001)" 
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && triggerDiagnosis()}
          />
          <button 
            onClick={() => triggerDiagnosis()}
            disabled={loading}
            className="bg-[#4e4376] text-white px-8 md:px-10 py-3 rounded-xl font-black text-xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            GO
          </button>
        </div>
      </section>

      {/* K线与实时数据 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* 左侧 K线 - 移除遮罩，直接显示 */}
        <div className="col-span-1 md:col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[450px]">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-800">{stockData.name}</span>
              <span className="px-3 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">{stockData.symbol}</span>
            </div>
            {/* 状态指示灯 - 替代繁琐文字 */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
               </span>
               <span className="text-[10px] font-black text-green-700">北京数据源已连接</span>
            </div>
          </div>
          <div className="flex-1 relative bg-white p-2">
             {/* 直接传递 symbol，由 KLineChart 内部处理数据拉取 */}
             <KLineChart symbol={stockData.symbol} />
          </div>
        </div>

        {/* 右侧 实时盘口 */}
        <div className="col-span-1 md:col-span-4 bg-white rounded-[2rem] border border-slate-300 p-8 flex flex-col justify-center relative shadow-sm">
           <p className="text-[10px] font-bold text-slate-400 tracking-widest mb-1">REAL-TIME PRICE</p>
           <h3 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter italic font-mono">
             <small className="text-2xl not-italic mr-1 text-slate-400">¥</small>{stockData.price}
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                <p className="text-[10px] text-slate-400 mb-1 font-bold">当日涨跌</p>
                <p className={`text-xl font-black ${stockData.change.includes('+') || parseFloat(stockData.change) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {stockData.change}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                <p className="text-[10px] text-slate-400 mb-1 font-bold">AI 综合评分</p>
                <p className="text-xl font-black text-[#4e4376]">{stockData.score}</p>
              </div>
           </div>
        </div>
      </div>

      {/* 8维卡片 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {dimensionMap.map((d, i) => (
          <div key={i} className="group aspect-square bg-white/40 backdrop-blur-lg p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center">
            <div className="text-4xl md:text-5xl mb-3 drop-shadow-sm">{d.icon}</div>
            <h4 className="font-black text-slate-700 text-sm md:text-lg mb-2">{d.title}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-4">
              {stockData.decisions[d.key] || "正在获取最新维度数据..."}
            </p>
          </div>
        ))}
      </section>

      {/* 决策条 */}
      <section className="bg-gradient-to-r from-[#2b5876] to-[#4e4376] rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="text-center md:border-r border-white/20 md:pr-10">
            <p className="text-[10px] font-bold text-blue-300 mb-1 uppercase tracking-widest">AI Power</p>
            <p className="text-7xl font-black italic tracking-tighter">{stockData.score}</p>
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-3xl font-black">
              建议：{stockData.score >= 80 ? '积极买入' : stockData.score >= 50 ? '谨慎持股' : '规避风险'}
            </h4>
            <p className="text-blue-100/60 text-xs md:text-sm max-w-2xl italic leading-relaxed">
              {stockData.summary}
            </p>
          </div>
        </div>
        <button 
          onClick={() => window.open(`${BEIJING_SERVER}/api/stock_full_report?symbol=${stockData.symbol}`)}
          className="mt-6 md:mt-0 bg-white text-[#4e4376] px-10 py-5 rounded-2xl font-black shadow-xl hover:bg-slate-100 transition-all active:scale-95"
        >
           查看完整报告
        </button>
      </section>
    </div>
  );
};

export default DiagnosisPage;