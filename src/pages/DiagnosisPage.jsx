import React, { useState, useEffect, useCallback } from 'react';
import KLineChart from '../components/KLineChart';
import MarketTicker from '../components/MarketTicker';
import api from '../api';

// 如果你本地没有 components/ui/card，请先用这个简单的 UI 封装
const Card = ({ children, className }) => <div className={`bg-white rounded-xl shadow-sm border border-slate-100 ${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="p-4 border-b border-slate-50 font-bold text-slate-700">{children}</div>;
const CardContent = ({ children, className }) => <div className={`p-4 ${className}`}>{children}</div>;

const DiagnosisPage = () => {
  const [currentStock, setCurrentStock] = useState({ code: '600519', name: '贵州茅台' });
  const [loading, setLoading] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [aiData, setAiData] = useState(null);

  const fetchData = async (code) => {
    setLoading(true);
    try {
      // 1. 获取 AI 决策 (包含 8 维度)
      const res = await api.get(`/api/stock_decision?symbol=${code}`);
      if (res.status === 'success') {
        setAiData(res);
      }
    } catch (err) {
      console.error("AI 接口报错:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchCode) return;
    const code = searchCode.trim();
    setCurrentStock({ code, name: '加载中...' });
    fetchData(code);
  };

  return (
    <div className="p-4 space-y-6 max-w-[1600px] mx-auto">
      {/* 顶部：搜索 + 跑马灯 */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input 
            className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入股票代码 (如 600519)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
          <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">GO</button>
        </div>
        <MarketTicker />
      </div>

      {/* 中间：K线图 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>实盘 K 线走势 - {currentStock.name} ({currentStock.code})</CardHeader>
          <CardContent className="h-[500px]">
             {/* 这里的 symbol 必须传给 KLineChart，它内部会自己去 fetch */}
            <KLineChart symbol={currentStock.code} height={450} />
          </CardContent>
        </Card>

        {/* 右侧：资讯占位 (原 StockNews) */}
        <Card className="lg:col-span-1">
          <CardHeader>实时资讯</CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg animate-pulse">正在获取最新行业快照...</div>
              <div className="p-3 bg-slate-50 rounded-lg animate-pulse text-xs text-slate-400">同步通达信资讯中...</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 底部：8 个 AI 维度卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["fundamental", "technical", "capital", "sentiment", "policy", "macro", "risk", "comprehensive"].map(key => {
          const item = aiData?.ai_8_dimensions?.[key] || { score: '-', desc: '待扫描' };
          return (
            <Card key={key} className="hover:border-blue-300 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="text-xs text-slate-500 uppercase">{key}</div>
                <div className={`text-2xl font-black my-1 ${item.score > 70 ? 'text-red-500' : 'text-slate-700'}`}>{item.score}</div>
                <div className="text-sm font-bold text-slate-800">{item.desc}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 底部：决策建议 */}
      {aiData && (
        <Card className="bg-blue-600 text-white border-none shadow-xl">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <div className="text-blue-100 text-sm">AI 实战建议</div>
              <div className="text-2xl font-bold">{aiData.advice?.message}</div>
            </div>
            <div className="text-right">
              <div className="text-blue-100 text-sm">预期目标</div>
              <div className="text-3xl font-black">¥{aiData.target_price}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiagnosisPage;