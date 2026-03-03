import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Activity, TrendingUp, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import KLineChart from './KLineChart';
import OrderBook from './OrderBook';
import MarketTicker from './MarketTicker';
import StockNews from './StockNews';
import { fetchStockRealtime, fetchAIDiagnosis, searchStockSuggestion } from '../services/api';

// 默认显示的股票
const DEFAULT_STOCK = {
  code: '600519',
  name: '贵州茅台',
  market: 'sh'
};

const DiagnosisPage = () => {
  // --- 状态管理 ---
  const [currentStock, setCurrentStock] = useState(DEFAULT_STOCK);
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // 数据状态
  const [realtimeData, setRealtimeData] = useState(null);
  const [klineData, setKlineData] = useState([]);
  const [aiData, setAiData] = useState(null);
  
  // 加载与错误状态
  const [loadingRealtime, setLoadingRealtime] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [error, setError] = useState(null);

  // 【关键修改】新增状态：标记用户是否主动执行过搜索
  // false = 初始状态，不加载 AI，显示占位符
  // true = 用户已搜索，加载 AI 数据
  const [hasSearched, setHasSearched] = useState(false);

  const suggestionTimer = useRef(null);

  // --- 数据获取函数 ---

  // 1. 获取实时行情和 K 线 (首页默认加载，搜索后也加载)
  const loadRealtimeData = async (code) => {
    setLoadingRealtime(true);
    setError(null);
    try {
      const data = await fetchStockRealtime(code);
      if (data && data.status === 'success') {
        setRealtimeData(data);
        // 假设 API 返回中包含 kline_data，如果没有可能需要单独调用
        // 这里根据你的 main.py 逻辑，stock_realtime 似乎同时返回了 price 和 kline_data
        if (data.kline_data) {
          setKlineData(data.kline_data);
        }
      } else {
        setError('获取行情数据失败');
      }
    } catch (err) {
      console.error('Realtime error:', err);
      setError('网络异常，无法获取行情');
    } finally {
      setLoadingRealtime(false);
    }
  };

  // 2. 获取 AI 诊断 (仅在用户主动搜索后调用)
  const loadAiDiagnosis = async (code) => {
    setLoadingAi(true);
    try {
      const data = await fetchAIDiagnosis(code);
      if (data && data.status === 'success') {
        setAiData(data);
      } else {
        setAiData(null); // 清除旧数据以防误导
        setError('AI 分析服务暂时不可用');
      }
    } catch (err) {
      console.error('AI Diagnosis error:', err);
      setAiData(null);
      setError('AI 分析请求失败');
    } finally {
      setLoadingAi(false);
    }
  };

  // --- 副作用 (Effects) ---

  // 初始化：仅加载默认股票的行情和 K 线，**不**加载 AI
  useEffect(() => {
    loadRealtimeData(DEFAULT_STOCK.code);
    
    // 清理建议框
    return () => {
      if (suggestionTimer.current) clearTimeout(suggestionTimer.current);
    };
  }, []);

  // 处理搜索建议
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (value.length >= 2) {
      if (suggestionTimer.current) clearTimeout(suggestionTimer.current);
      
      suggestionTimer.current = setTimeout(async () => {
        try {
          const results = await searchStockSuggestion(value);
          setSuggestions(results || []);
          setShowSuggestions(true);
        } catch (err) {
          setSuggestions([]);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 处理搜索提交 (核心逻辑修改处)
  const handleSearch = (code, name, market) => {
    const finalCode = code || searchInput;
    const finalName = name || searchInput;
    const finalMarket = market || (finalCode.startsWith('6') ? 'sh' : 'sz');

    if (!finalCode) return;

    // 1. 更新当前股票状态
    const newStock = { code: finalCode, name: finalName, market: finalMarket };
    setCurrentStock(newStock);
    
    // 2. 关闭建议框
    setShowSuggestions(false);
    setSearchInput('');
    setSuggestions([]);

    // 3. 立即刷新 K 线和实盘数据
    loadRealtimeData(finalCode);

    // 4. 【关键修改】标记已搜索，并触发 AI 分析
    setHasSearched(true);
    loadAiDiagnosis(finalCode);
  };

  const selectSuggestion = (stock) => {
    handleSearch(stock.code, stock.name, stock.market);
  };

  // --- 渲染辅助组件 ---

  // 渲染 AI 卡片的占位符 (未搜索时显示)
  const renderPlaceholderCard = (title, icon: React.ReactNode) => (
    <Card className="h-full bg-slate-50 border-dashed border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-20 flex items-center justify-center text-xs text-slate-400 text-center px-2">
          请输入股票代码并点击搜索<br/>以获取 AI 深度分析
        </div>
      </CardContent>
    </Card>
  );

  // 渲染真实的 AI 卡片内容
  const renderAiCard = (title, value, detail, icon: React.ReactNode, colorClass = "text-blue-600") => (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`text-2xl font-bold ${colorClass}`}>
          {value || '--'}
        </div>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 h-8">
          {detail || '暂无详细分析'}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 space-y-6">
      {/* 顶部跑马灯 */}
      <MarketTicker />

      {/* 头部搜索区 */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <div className="flex gap-2">
                <Input
                  placeholder="输入股票代码或名称 (例: 600519)"
                  value={searchInput}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={() => handleSearch()} disabled={!searchInput && !currentStock.code}>
                  <Search className="w-4 h-4 mr-2" />
                  GO
                </Button>
              </div>
              
              {/* 搜索建议下拉框 */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                  {suggestions.map((stock) => (
                    <div
                      key={stock.code}
                      className="px-4 py-2 hover:bg-slate-100 cursor-pointer flex justify-between items-center"
                      onClick={() => selectSuggestion(stock)}
                    >
                      <span className="font-medium">{stock.name}</span>
                      <span className="text-xs text-slate-500">{stock.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>当前关注: <strong className="text-slate-900">{currentStock.name} ({currentStock.code})</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 主内容区：K 线与实盘 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：K 线图 (占 2/3) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              K 线走势
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRealtime && !klineData.length ? (
              <div className="h-96 flex items-center justify-center text-slate-400">加载图表中...</div>
            ) : (
              <KLineChart data={klineData} symbol={currentStock.code} />
            )}
          </CardContent>
        </Card>

        {/* 右侧：五档实盘 (占 1/3) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              实时盘口
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRealtime && !realtimeData ? (
              <div className="h-96 flex items-center justify-center text-slate-400">加载盘口中...</div>
            ) : realtimeData ? (
              <OrderBook data={realtimeData} />
            ) : (
              <div className="h-96 flex items-center justify-center text-slate-400">暂无数据</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 底部：AI 深度分析区 (8 个小卡片) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            AI 深度决策分析
            {!hasSearched && <Badge variant="secondary" className="ml-2 font-normal">待激活</Badge>}
            {loadingAi && <Badge variant="outline" className="ml-2 animate-pulse">分析中...</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasSearched ? (
            // 【状态 A】未搜索：显示灰色占位符
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {renderPlaceholderCard("综合评分", <Activity className="w-4 h-4" />)}
              {renderPlaceholderCard("基本面", <TrendingUp className="w-4 h-4" />)}
              {renderPlaceholderCard("技术面", <Activity className="w-4 h-4" />)}
              {renderPlaceholderCard("资金流向", <RefreshCw className="w-4 h-4" />)}
              {renderPlaceholderCard("市场情绪", <Shield className="w-4 h-4" />)}
              {renderPlaceholderCard("估值分析", <TrendingUp className="w-4 h-4" />)}
              {renderPlaceholderCard("波动率", <Activity className="w-4 h-4" />)}
              {renderPlaceholderCard("目标价", <Shield className="w-4 h-4" />)}
            </div>
          ) : loadingAi ? (
            // 【状态 B】加载中
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="h-32 animate-pulse bg-slate-50">
                  <CardContent className="p-4 flex flex-col justify-center h-full">
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : aiData ? (
            // 【状态 C】有数据：显示真实分析结果
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {renderAiCard(
                "综合评分", 
                aiData.ai_8_dimensions?.comprehensive || "N/A", 
                aiData.message, 
                <Activity className="w-4 h-4" />,
                "text-blue-600"
              )}
              {renderAiCard(
                "基本面", 
                aiData.ai_8_dimensions?.fundamental || "N/A", 
                aiData.ai_8_dimensions?.fundamental_desc || "", 
                <TrendingUp className="w-4 h-4" />,
                "text-green-600"
              )}
              {renderAiCard(
                "技术面", 
                aiData.ai_8_dimensions?.technical || "N/A", 
                aiData.ai_8_dimensions?.technical_desc || "", 
                <Activity className="w-4 h-4" />,
                "text-purple-600"
              )}
              {renderAiCard(
                "资金流向", 
                aiData.ai_8_dimensions?.liquidity || "N/A", 
                aiData.ai_8_dimensions?.liquidity_desc || "", 
                <RefreshCw className="w-4 h-4" />,
                "text-red-600"
              )}
              {renderAiCard(
                "市场情绪", 
                aiData.ai_8_dimensions?.sentiment || "N/A", 
                aiData.ai_8_dimensions?.sentiment_desc || "", 
                <Shield className="w-4 h-4" />,
                "text-orange-600"
              )}
              {renderAiCard(
                "估值分析", 
                aiData.ai_8_dimensions?.valuation || "N/A", 
                aiData.ai_8_dimensions?.valuation_desc || "", 
                <TrendingUp className="w-4 h-4" />,
                "text-indigo-600"
              )}
              {renderAiCard(
                "波动率", 
                aiData.ai_8_dimensions?.volatility || "N/A", 
                aiData.ai_8_dimensions?.volatility_desc || "", 
                <Activity className="w-4 h-4" />,
                "text-pink-600"
              )}
              {renderAiCard(
                "目标价", 
                aiData.target_price?.medium_term || "N/A", 
                `短期: ${aiData.target_price?.short_term || '-'} | 中期: ${aiData.target_price?.medium_term || '-'}`, 
                <Shield className="w-4 h-4" />,
                "text-slate-700"
              )}
            </div>
          ) : (
            // 【状态 D】搜索了但没数据
            <div className="text-center py-10 text-slate-500">
              暂无 AI 分析数据，请尝试其他股票
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 新闻模块 (可选，保持原有逻辑) */}
      <StockNews symbol={currentStock.code} />
    </div>
  );
};

export default DiagnosisPage;