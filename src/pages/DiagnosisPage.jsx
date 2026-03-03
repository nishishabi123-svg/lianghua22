import React, { useState, useEffect, useCallback } from 'react';
import KLineChart from '../components/KLineChart';
import MarketTicker from '../components/MarketTicker';
import api from '../api';

// 常用股票代码建议
const stockSuggestions = [
  { code: '600519', name: '贵州茅台' },
  { code: '000001', name: '平安银行' },
  { code: '000858', name: '五粮液' },
  { code: '300059', name: '东方财富' },
];

const DiagnosisPage = () => {
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState({ 
    code: '600519', name: '贵州茅台', price: '--', change: '--' 
  });
  
  // AI 诊断状态
  const [aiData, setAiData] = useState(null);
  const [error, setError] = useState(null);

  // 获取数据函数
  const fetchDiagnosis = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    try {
      // 1. 获取 AI 决策数据
      const res = await api.get(`/api/stock_decision?symbol=${code}`);
      if (res.status === 'success') {
        setAiData(res);
        // 如果后端返回了名称和价格，更新头部
        if (res.name) {
          setCurrentStock(prev => ({ ...prev, code, name: res.name }));
        }
      } else {
        setError(res.message || '诊断失败');
      }
    } catch (err) {
      setError('后端连接超时或 500 错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    // 首页只展示，不自动触发耗时 AI (对齐要素8)
    console.log("首页冷启动，等待搜索...");
  }, []);

  const handleSearch = () => {
    if (!searchCode) return;
    fetchDiagnosis(searchCode);
  };

  // 渲染 AI 维度小卡片
  const renderDimensionCards = () => {
    const keys = ["fundamental", "technical", "capital", "sentiment", "policy", "macro", "risk", "comprehensive"];
    const labels = {
      fundamental: "基本面", technical: "技术面", capital: "资金流", 
      sentiment: "情绪面", policy: "政策面", macro: "宏观面", 
      risk: "风险探测", comprehensive: "综合结论"
    };

    if (!aiData) return <div className="col-span-4 py-20 text-center opacity-50">输入代码并点击 GO 开启 AI 实战诊断</div>;

    return keys.map(key => {
      const item = aiData.ai_8_dimensions?.[key] || { score: 0, desc: '无数据' };
      return (
        <div key={key} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-500 font-medium">{labels[key]}</span>
            <span className={`text-lg font-bold ${item.score >= 80 ? 'text-red-500' : item.score >= 60 ? 'text-orange-500' : 'text-slate-400'}`}>
              {item.score}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-800 mb-1">{item.desc}</p>
          <p className="text-xs text-slate-500 line-clamp-2">{item.full_desc || '点击查看详情...'}</p>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 顶部搜索栏 */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex-1 relative w-full">
          <input 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="搜索股票代码 (如 600519)..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <span className="absolute left-3 top-3 text-slate-400">🔍</span>
        </div>
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="w-full md:w-32 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {loading ? '诊断中...' : 'GO 诊断'}
        </button>
      </div>

      {/* 跑马灯组件 */}
      <div className="bg-slate-900 rounded-xl overflow-hidden py-1">
        <MarketTicker />
      </div>

      {/* 核心数据区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 K 线 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800">{currentStock.name}</h2>
              <p className="text-slate-400 text-sm font-mono">{currentStock.code}</p>
            </div>
          </div>
          <div className="h-[450px] w-full bg-slate-50 rounded-lg overflow-hidden">
            <KLineChart symbol={currentStock.code} height={450} />
          </div>
        </div>

        {/* 右侧 AI 诊断卡片网格 */}
        <div className="lg:col-span-1 grid grid-cols-2 gap-3">
          {renderDimensionCards()}
          
          {/* AI 建议汇总卡片 */}
          {aiData && (
            <div className="col-span-2 mt-2 bg-blue-600 p-5 rounded-2xl text-white shadow-xl shadow-blue-200">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                🚀 AI 决策建议: {aiData.advice?.message}
              </h4>
              <p className="text-xs opacity-90 leading-relaxed">
                目标价参考: <span className="text-lg font-bold">¥{aiData.target_price}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-center font-medium">
          {error}
        </div>
      )}
    </div>
  );
};

export default DiagnosisPage;