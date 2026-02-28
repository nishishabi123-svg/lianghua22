import React, { useState } from 'react';
import KLineChart from '../components/KLineChart';
import SearchHero from '../components/SearchHero';
import AIAccordion from '../components/AIAccordion';
import api from '../api';

const DiagnosisPage = ({ onSearch, searchLoading, isPageLoading }) => {
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const triggerDiagnosis = async (codes) => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        codes.map(async (code) => {
          const res = await api.get(`/api/stock_decision?code=${code}`);
          if (res.data) {
            return {
              code: code,
              name: res.data.base_info?.name || code,
              price: res.data.base_info?.price || 0,
              change_pct: res.data.base_info?.change_pct || 0,
              ai_analysis: res.data.ai_analysis || {}
            };
          }
          return null;
        })
      );
      
      const validResults = results.filter(Boolean);
      setStockList(validResults);
    } catch (err) {
      console.error('诊断失败:', err);
      setError('诊断请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const currentStock = stockList[0] || {
    code: '600519', 
    name: '贵州茅台', 
    price: 1685.20, 
    change_pct: 2.45
  };

  const hotSectors = [
    { name: '半导体', change: 1.85, leader: '中芯国际' },
    { name: '新能源', change: 0.5, leader: '比亚迪' },
    { name: '人工智能', change: 2.3, leader: '科大讯飞' },
    { name: '生物医药', change: -0.8, leader: '恒瑞医药' }
  ];

  const renderMarketStatus = () => {
    if (!stockList?.length) return null;
    
    return (
      <div className="market-status space-y-4">
        {stockList.map((stock, idx) => (
          <div key={idx} className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {stock.name} <span className="text-sm text-slate-400">{stock.code}</span>
                </h3>
                <p className="text-2xl font-black mt-2">¥{stock.price}</p>
              </div>
              <div className={`text-xl font-bold ${stock.change_pct >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct}%
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMarketSplit = () => {
    return (
      <div className="grid grid-cols-12 gap-6 h-[480px] market-split">
        {/* 左侧：K线图区域 */}
        <div className="col-span-8 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
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
            <KLineChart symbol={currentStock.code} height="100%" />
          </div>
        </div>

        {/* 右侧：热门板块 */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="section-title">今日热门板块</h3>
            <div className="hot-sector-list">
              {hotSectors.map((sector, idx) => (
                <div key={idx} className="hot-sector-item">
                  <div>
                    <div className="hot-sector-name">{sector.name}</div>
                    <div className="hot-sector-leader">龙头: {sector.leader}</div>
                  </div>
                  <div className={`hot-sector-change ${sector.change >= 0 ? 'positive' : 'negative'}`}>
                    {sector.change >= 0 ? '+' : ''}{sector.change}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAIAnalysis = () => {
    if (!stockList?.length) return null;
    
    return (
      <div className="space-y-6">
        {stockList.map((stock, idx) => (
          <AIAccordion key={idx} stockCode={stock.code} />
        ))}
      </div>
    );
  };

  const renderLoading = () => {
    if (!loading && !isPageLoading) return null;
    
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-500">诊断分析中...</div>
      </div>
    );
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
        {error}
      </div>
    );
  };

  return (
    <div className="flex gap-6">
      <div className="page-container diagnosis-page flex-1 space-y-6">
        <SearchHero onSearch={triggerDiagnosis} loading={searchLoading || isPageLoading} />
        {renderMarketStatus()}
        {stockList?.length > 0 && renderMarketSplit()}
        {renderLoading()}
        {renderAIAnalysis()}
        {renderError()}
      </div>
    </div>
  );
};

export default DiagnosisPage;