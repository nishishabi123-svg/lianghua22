import React, { useState, useEffect, useCallback } from 'react';
import KLineChart from '../components/KLineChart';
import api from '../api'; // 使用上面的 index.js

const DiagnosisPage = () => {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState({
    name: '平安银行',
    symbol: '000001',
    price: '--.--',
    change: '0.00%',
    score: 80,
    summary: '行情数据实时同步中...',
    decisions: {} 
  });

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
      // 必须使用 /api/stock_decision?code=...
      const res = await api.get(`/api/stock_decision?code=${code}`);
      if (res.status === 'success' && res.data) {
        const { base_info, ai_analysis } = res.data;
        setStockData({
          name: base_info.name,
          symbol: base_info.code,
          price: base_info.price,
          change: base_info.change_pct || '0.00%', // 关键：后端字段是 change_pct
          score: ai_analysis.score,
          summary: ai_analysis.summary,
          decisions: ai_analysis.decision
        });
      }
    } catch (err) {
      console.error("北京服务器通信失败");
    } finally {
      setLoading(false);
    }
  }, [searchSymbol]);

  useEffect(() => { triggerDiagnosis('000001'); }, []);

  return (
    <div className="space-y-6 pb-20 px-4 md:px-0">
      <section className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col items-center">
        <div className="w-full max-w-2xl flex p-1.5 bg-slate-100 rounded-2xl border border-slate-300">
          <input 
            className="flex-1 bg-transparent px-6 outline-none font-bold" 
            placeholder="输入代码 (如: 000001)" 
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && triggerDiagnosis()}
          />
          <button onClick={() => triggerDiagnosis()} className="bg-[#4e4376] text-white px-8 py-3 rounded-xl font-black">GO</button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden h-[500px] flex flex-col">
          <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black">{stockData.name}</span>
              <span className="text-sm font-mono text-slate-400">{stockData.symbol}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
               <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-green-500"></span></span>
               <span className="text-[10px] font-bold text-green-700">LIVE</span>
            </div>
          </div>
          <div className="flex-1"><KLineChart symbol={stockData.symbol} /></div>
        </div>

        <div className="col-span-1 md:col-span-4 bg-white rounded-[2rem] border border-slate-300 p-8 flex flex-col justify-center shadow-sm">
           <p className="text-[10px] font-bold text-slate-400 mb-1">REAL-TIME PRICE</p>
           <h3 className="text-6xl font-black text-slate-900 mb-6 italic">
             <small className="text-2xl not-italic mr-1 text-slate-400">¥</small>{stockData.price}
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-400 mb-1 font-bold">当日涨跌</p>
                <p className={`text-xl font-black ${stockData.change.includes('+') ? 'text-red-500' : 'text-green-600'}`}>{stockData.change}</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-[10px] text-slate-400 mb-1 font-bold">AI评分</p>
                <p className="text-xl font-black text-[#4e4376]">{stockData.score}</p>
              </div>
           </div>
        </div>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dimensionMap.map((d, i) => (
          <div key={i} className="bg-white/60 p-6 rounded-[2rem] border border-slate-300 text-center shadow-sm">
            <div className="text-4xl mb-2">{d.icon}</div>
            <h4 className="font-black text-slate-700 text-sm mb-1">{d.title}</h4>
            <p className="text-[11px] text-slate-500 line-clamp-4">{stockData.decisions[d.key] || "计算中..."}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default DiagnosisPage;