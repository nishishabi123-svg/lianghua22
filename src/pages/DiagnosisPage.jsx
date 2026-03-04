import React, { useState, useEffect } from 'react';
import KLineChart from '../components/KLineChart';
import StockNews from '../components/StockNews';
import api from '../api';

// 导入原版 UI 组件
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DiagnosisPage = () => {
  const [currentStock, setCurrentStock] = useState({ code: '600519', name: '贵州茅台' });
  const [searchCode, setSearchCode] = useState('');
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 只负责 AI 诊断数据，K线由 KLineChart 组件内部自己获取
  const fetchAiData = async (code) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/stock_decision?symbol=${code}`);
      // 这里的 res 已经是被 index.js 拦截器处理过的扁平对象
      if (res.status === 'success') {
        setAiData(res);
      }
    } catch (err) {
      console.error("AI分析失败", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchCode) return;
    const code = searchCode.trim();
    setCurrentStock({ code, name: '搜索中...' });
    fetchAiData(code);
  };

  return (
    <div className="space-y-6">
      {/* 搜索栏 - 保持原版简约风格 */}
      <div className="flex gap-2 max-w-md">
        <Input 
          placeholder="代码, 如 600519" 
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? '分析中...' : 'GO 诊断'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 K 线 - 使用子组件自抓取模式 */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>实盘 K 线: {currentStock.code}</CardTitle>
            </CardHeader>
            <CardContent className="h-[500px]">
              {/* 注意：不传 data，只传 symbol，内部自动 fetch */}
              <KLineChart symbol={currentStock.code} height={450} />
            </CardContent>
          </Card>
        </div>

        {/* 右侧：资讯 */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>相关资讯</CardTitle>
            </CardHeader>
            <CardContent>
              <StockNews symbol={currentStock.code} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 8 个维度卡片 - 修正数据引用 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["fundamental", "technical", "capital", "sentiment", "policy", "macro", "risk", "comprehensive"].map(key => {
          const item = aiData?.ai_8_dimensions?.[key] || { score: '-', desc: '待扫描' };
          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <p className="text-xs text-slate-400 uppercase font-bold">{key}</p>
                <h3 className={`text-3xl font-black my-2 ${item.score > 70 ? 'text-red-500' : 'text-slate-700'}`}>
                  {item.score}
                </h3>
                <p className="text-sm font-bold text-slate-800">{item.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 底部决策卡片 */}
      {aiData && (
        <Card className="bg-blue-600 text-white border-none">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="opacity-80 text-sm font-bold">AI 实战建议</p>
              <h2 className="text-2xl font-black">{aiData.advice?.message}</h2>
            </div>
            <div className="text-right">
              <p className="opacity-80 text-sm font-bold">目标价参考</p>
              <h2 className="text-3xl font-mono font-black">¥{aiData.target_price}</h2>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiagnosisPage;