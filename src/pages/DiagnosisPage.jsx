import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MarketStatusBar from '../components/MarketStatusBar';
import AIDepthAnalysis from '../components/AIDepthAnalysis';
import DecisionCard from '../components/DecisionCard';
import CyberCard from '../components/CyberCard';
import IdleMarketDisplay from '../components/IdleMarketDisplay';
import DynamicSidebar from '../components/DynamicSidebar';
import KLineChart from '../components/KLineChart';
import api from '../api';
import { validateStockData } from '../api/stock';

// 自定义 Hook：获取 /api/stock_decision 的决策数据
const useStockDecision = (symbol) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 拉取决策数据，并用 stockSchema 做结构校验
  const fetchDecision = useCallback(async () => {
    if (!symbol || symbol === '--') {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/stock_decision?symbol=${symbol}`);
      const { valid, errors } = validateStockData(response);

      if (!valid) {
        setData(null);
        setError(`数据结构校验失败：${errors.join('；')}`);
        return;
      }

      setData(response);
    } catch (err) {
      console.error('获取决策数据失败:', err);
      setData(null);
      setError(err.message || '获取决策数据失败');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  // 监听股票代码变化，自动刷新
  useEffect(() => {
    fetchDecision();
  }, [fetchDecision]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchDecision
  };
};

const DiagnosisPage = ({
  stockData,
  previousStockData,
  loading,
  error,
  marketStatus,
  lastUpdate,
  autoRefreshEnabled,
  refreshInterval,
  onToggleAutoRefresh,
  onManualRefresh,
  onIntervalChange,
  onMarketStatusChange,
  currentStockCode,
  stockList,
  isVip
}) => {
  // 计算主展示股票，优先使用实时行情，其次用列表首条
  const primaryStock = useMemo(() => stockData || stockList?.[0] || null, [stockData, stockList]);

  // 右侧动态栏优先使用当前股票代码
  const sidebarStockCode = useMemo(
    () => currentStockCode || primaryStock?.code,
    [currentStockCode, primaryStock]
  );

  // 空闲状态：没有股票列表且不在加载
  const isIdle = useMemo(() => !stockList?.length && !loading, [stockList, loading]);

  // 使用决策数据（来自 /api/stock_decision）
  const decisionSymbol = primaryStock?.code || currentStockCode;
  const {
    data: decisionData,
    isLoading: decisionLoading,
    error: decisionError,
    refresh: refreshDecision
  } = useStockDecision(decisionSymbol);

  // 合并加载与错误状态，统一展示
  const isPageLoading = loading || decisionLoading;
  const pageError = error || decisionError;

  // 图表数据仅使用 10 日收盘价，避免在渲染中重复计算
  const chartData = useMemo(
    () => decisionData?.simple_chart?.last_10_days || [],
    [decisionData]
  );

  // 统一的重试逻辑：刷新行情 + 刷新决策
  const handleRetry = useCallback(() => {
    onManualRefresh?.();
    refreshDecision();
  }, [onManualRefresh, refreshDecision]);

  // 渲染市场状态区域
  const renderMarketStatus = () => (
    <section className="market-status-section rounded-xl bg-white/5 p-4 shadow-sm backdrop-blur">
      <MarketStatusBar
        isMarketOpen={marketStatus.isMarketOpen}
        lastUpdate={lastUpdate}
        onStatusChange={onMarketStatusChange}
      />
    </section>
  );

  // 渲染控制区域
  const renderControlPanel = () => (
    <section className="control-section rounded-xl bg-white/5 p-4 shadow-sm backdrop-blur">
      <div className="control-panel flex flex-wrap items-center gap-4">
        <button
          onClick={onToggleAutoRefresh}
          className={`cyber-button ${autoRefreshEnabled ? 'active' : ''}`}
        >
          {autoRefreshEnabled ? '暂停刷新' : '开始刷新'}
        </button>

        <button
          onClick={onManualRefresh}
          className="cyber-button"
          disabled={isPageLoading}
        >
          {isPageLoading ? '刷新中...' : '立即刷新'}
        </button>

        <div className="interval-selector flex items-center gap-3 text-sm">
          <label className="text-white/70">刷新间隔</label>
          <select
            value={refreshInterval}
            onChange={(e) => onIntervalChange(Number(e.target.value))}
            className="cyber-input"
            disabled={!marketStatus.isMarketOpen}
          >
            <option value={3000}>3秒</option>
            <option value={4000}>4秒</option>
            <option value={5000}>5秒</option>
            <option value={10000}>10秒</option>
          </select>
        </div>

        {autoRefreshEnabled && (
          <div className="refresh-indicator flex items-center gap-2 text-sm text-white/70">
            <div className="refresh-dot"></div>
            <span>{marketStatus.isMarketOpen ? '实时刷新中' : '智能刷新中'}</span>
          </div>
        )}
      </div>
    </section>
  );

  // 渲染决策卡片区
  const renderDecisionCards = () => (
    <section className="decision-section space-y-4">
      {isIdle ? (
        <IdleMarketDisplay />
      ) : stockList?.length > 0 ? (
        <div className="decision-grid">
          {stockList.map((item) => (
            <DecisionCard key={item.code} stockData={item} isVip={isVip} />
          ))}
        </div>
      ) : (
        <CyberCard>
          <div className="empty-state-text">请输入股票代码查看决策卡片</div>
        </CyberCard>
      )}
    </section>
  );

  // 渲染 10 日 K 线图
  const renderChart = () => (
    <section className="chart-section rounded-xl bg-white/5 p-4 shadow-sm backdrop-blur">
      {decisionSymbol ? (
        <KLineChart
          stockCode={decisionSymbol}
          title="10 日精简 K 线"
          height={360}
          data={chartData}
        />
      ) : (
        <CyberCard>
          <div className="empty-state-text">请选择股票以查看 10 日 K 线</div>
        </CyberCard>
      )}
    </section>
  );

  // 渲染 AI 深度分析区域
  const renderAIAnalysis = () => (
    <section className="ai-section">
      {primaryStock ? (
        <AIDepthAnalysis stockCode={primaryStock.code} isVip={isVip} />
      ) : (
        <CyberCard>
          <div className="empty-state-text">请选择股票查看 AI 深度分析</div>
        </CyberCard>
      )}
    </section>
  );

  // 渲染错误提示区域
  const renderError = () => (
    pageError ? (
      <section className="error-section">
        <div className="error-container rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-100">
          <div className="error-message">错误: {pageError}</div>
          <button onClick={handleRetry} className="cyber-button mt-3">
            重试
          </button>
        </div>
      </section>
    ) : null
  );

  return (
    <div className="flex gap-6">
      <div className="page-container diagnosis-page flex-1 space-y-6">
        {/* 1) 市场状态区域 */}
        {renderMarketStatus()}

        {/* 2) 控制面板区域 */}
        {stockList?.length > 0 && renderControlPanel()}

        {/* 3) 决策卡片区域 */}
        {renderDecisionCards()}

        {/* 4) 10 日 K 线区域 */}
        {renderChart()}

        {/* 5) AI 深度分析区域 */}
        {renderAIAnalysis()}

        {/* 6) 统一错误提示 */}
        {renderError()}
      </div>

      {/* 右侧动态栏 */}
      <DynamicSidebar
        stockCode={sidebarStockCode}
        isVisible={!!sidebarStockCode && sidebarStockCode !== '--'}
      />
    </div>
  );
};

export default DiagnosisPage;

