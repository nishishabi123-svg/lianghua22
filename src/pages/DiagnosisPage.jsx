import React, { useState, useEffect } from 'react';
// ✅ 保留存在的组件导入
import KLineChart from '../components/KLineChart';
import MarketTicker from '../components/MarketTicker';
import StockNews from '../components/StockNews';
// ❌ 已删除: import OrderBook from '../components/OrderBook';

// 引入基础 UI 组件 (假设这些存在)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DiagnosisPage = () => {
  const [currentStock, setCurrentStock] = useState({ code: '600519', name: '贵州茅台' });
  const [klineData, setKlineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [realtimeData, setRealtimeData] = useState([]); // 模拟盘口数据，防止 OrderBook 移除后变量未定义报错

  // 模拟获取数据
  const fetchData = async (code) => {
    setLoading(true);
    try {
      // 模拟 K 线数据
      const mockKline = Array.from({ length: 50 }, (_, i) => ({
        time: `2023-10-${i + 1}`,
        open: 1700 + Math.random() * 50,
        high: 1750 + Math.random() * 50,
        low: 1680 + Math.random() * 50,
        close: 1720 + Math.random() * 50,
        volume: Math.floor(Math.random() * 10000)
      }));
      setKlineData(mockKline);
      
      // 模拟实时交易数据 (原本传给 OrderBook 的)
      setRealtimeData(Array.from({ length: 10 }, (_, i) => ({
        price: 1700 + i,
        amount: Math.floor(Math.random() * 100),
        type: i % 2 === 0 ? 'buy' : 'sell'
      })));
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentStock.code);
  }, [currentStock.code]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCode.trim()) {
      setCurrentStock({ code: searchCode, name: `股票${searchCode}` });
      setSearchCode('');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* 头部 */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">智能诊断分析</h1>
          <p className="text-gray-500 mt-1">{currentStock.name} ({currentStock.code})</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <Input 
            placeholder="输入股票代码" 
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="w-full md:w-64"
          />
          <Button type="submit" disabled={loading}>查询</Button>
        </form>
      </div>

      {/* 顶部跑马灯 (如果 MarketTicker 存在) */}
      <Card>
        <CardContent className="p-4">
           <MarketTicker symbol={currentStock.code} />
        </CardContent>
      </Card>

      {/* 主要内容区：图表 + 新闻 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 左侧：K 线图 (占 2 列) */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>K 线走势</CardTitle>
            </CardHeader>
            <CardContent className="h-[500px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">加载中...</div>
              ) : (
                <KLineChart data={klineData} symbol={currentStock.code} height={450} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：新闻列表 (占 1 列) */}
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

      {/* ⚠️ 已删除 OrderBook 组件区域 */}
      {/* 原本这里可能有 <OrderBook data={realtimeData} />，现已移除 */}

      <Alert>
        <AlertTitle>风险提示</AlertTitle>
        <AlertDescription>
          市场有风险，投资需谨慎。本页面数据仅供参考。
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DiagnosisPage;