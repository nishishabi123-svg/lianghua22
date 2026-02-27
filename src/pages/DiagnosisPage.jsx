import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MarketStatusBar from '../components/MarketStatusBar';
import DecisionCard from '../components/DecisionCard';
import CyberCard from '../components/CyberCard';
import IdleMarketDisplay from '../components/IdleMarketDisplay';
import DynamicSidebar from '../components/DynamicSidebar';
import KLineChart from '../components/KLineChart';
import CyberChart from '../components/CyberChart';
import SearchHero from '../components/SearchHero';
import AIAccordion from '../components/AIAccordion';
import api from '../api';
import { validateStockData } from '../api/stock';

const useStockDecision = (symbol) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDecision = useCallback(() => {
    if (!symbol || symbol === '--') {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    api
      .get(`/stock_decision?symbol=${symbol}`)
      .then((response) => {
        const { valid, errors } = validateStockData(response);

        if (!valid) {
          setData(null);
          setError(`数据结构校验失败：${errors.join('；')}`);
          return;
        }

        setData(response);
      })
      .catch((err) => {
        console.error('获取决策数据失败:', err);
        setData(null);
        setError(err.message || '获取决策数据失败');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [symbol]);

  useEffect(() => {
    fetchDecision();
  }, [fetchDecision]);

  useEffect(() => {
    console.log('🔍 Received Data:', data);
  }, [data]);

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
  onSearch,
  searchLoading,
  currentStockCode,
  stockList,
  isVip
}) => {
  const primaryStock = useMemo(() => stockData || stockList?.[0] || null, [stockData, stockList]);

  const sidebarStockCode = useMemo(
    () => currentStockCode || primaryStock?.code,
    [currentStockCode, primaryStock]
  );

  const isIdle = useMemo(() => !stockList?.length && !loading, [stockList, loading]);

  const decisionSymbol = primaryStock?.code || currentStockCode;
  const {
    data: decisionData,
    isLoading: decisionLoading,
    error: decisionError,
    refresh: refreshDecision
  } = useStockDecision(decisionSymbol);

  const isPageLoading = loading || decisionLoading;
  const pageError = error || decisionError;

  const chartData = useMemo(
    () => decisionData?.simple_chart?.last_10_days || [],
    [decisionData]
  );

  const hotSectors = useMemo(() => ([
    { name: '半导体', change: 1.85, leader: '北方华创' },
    { name: '新能源', change: 0.5, leader: '宁德时代' },
    { name: 'AI 服务器', change: 2.12, leader: '浪潮信息' },
    { name: '医药创新', change: -0.34, leader: '恒瑞医药' },
    { name: '数字金融', change: 0.78, leader: '东方财富' }
  ]), []);

  const handleRetry = useCallback(() => {
    onManualRefresh?.();
    refreshDecision();
  }, [onManualRefresh, refreshDecision]);

  const renderMarketStatus = () => (
    <section className="market-status-section rounded-xl bg-white/5 p-4 shadow-sm backdrop-blur">
      <MarketStatusBar
        isMarketOpen={marketStatus.isMarketOpen}
        lastUpdate={lastUpdate}
        onStatusChange={onMarketStatusChange}
      />
    </section>
  );

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

  const renderCharts = () => (
    <div className="chart-stack space-y-4">
      {primaryStock ? (
        <CyberChart data={primaryStock} title="今日分时走势" height={260} />
      ) : (
        <CyberCard>
          <div className="empty-state-text">请选择股票以查看分时走势</div>
        </CyberCard>
      )}
      <section className="chart-section rounded-xl bg-white/5 p-4 shadow-sm backdrop-blur">
        {decisionSymbol ? (
          <KLineChart
            stockCode={decisionSymbol}
            title="10 日精简 K 线"
            height={300}
            data={chartData}
          />
        ) : (
          <CyberCard>
            <div className="empty-state-text">请选择股票以查看 10 日 K 线</div>
          </CyberCard>
        )}
      </section>
    </div>
  );

  const renderHotSectors = () => (
    <section className="hot-sectors rounded-xl bg-white/5 p-4 shadow-sm backdrop-blur">
      <div className="section-title">今日热门板块</div>
      <div className="hot-sector-list">
        {hotSectors.map((sector) => (
          <div key={sector.name} className="hot-sector-item">
            <div>
              <div className="hot-sector-name">{sector.name}</div>
              <div className="hot-sector-leader">龙头：{sector.leader}</div>
            </div>
            <div className={`hot-sector-change ${sector.change >= 0 ? 'positive' : 'negative'}`}>
              {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderMarketSplit = () => (
    <section className="market-split grid gap-6 lg:grid-cols-[2.2fr_1fr]">
      {renderCharts()}
      {renderHotSectors()}
    </section>
  );

  const renderAIAnalysis = () => (
    <section className="ai-section">
      {primaryStock ? (
        <AIAccordion stockCode={primaryStock.code} />
      ) : (
        <CyberCard>
          <div className="empty-state-text">请选择股票查看 AI 决策分析</div>
        </CyberCard>
      )}
    </section>
  );

  const renderLoading = () => (
    isPageLoading ? (
      <section className="loading-section">
        <div className="loading-container rounded-xl bg-white/5 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white/70">正在加载数据...</div>
        </div>
      </section>
    ) : null
  );

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
        <SearchHero onSearch={onSearch} loading={searchLoading || isPageLoading} />
        {renderMarketStatus()}
        {stockList?.length > 0 && renderControlPanel()}
        {renderLoading()}
        {renderMarketSplit()}
        {renderDecisionCards()}
        {renderAIAnalysis()}
        {renderError()}
      </div>

      <DynamicSidebar
        stockCode={sidebarStockCode}
        isVisible={!!sidebarStockCode && sidebarStockCode !== '--'}
      />
    </div>
  );
};

export default DiagnosisPage;
