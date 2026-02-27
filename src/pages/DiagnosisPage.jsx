import React from 'react';
import MarketStatusBar from '../components/MarketStatusBar';
import CyberChart from '../components/CyberChart';
import AIDepthAnalysis from '../components/AIDepthAnalysis';
import DecisionCard from '../components/DecisionCard';
import CyberCard from '../components/CyberCard';
import IdleMarketDisplay from '../components/IdleMarketDisplay';
import DynamicSidebar from '../components/DynamicSidebar';

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
  const primaryStock = stockData || stockList?.[0];
  const sidebarStockCode = currentStockCode || primaryStock?.code;
  
  const isIdle = !stockList?.length && !loading;

  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      <div className="page-container diagnosis-page" style={{ flex: 1 }}>
      <section className="market-status-section">
        <MarketStatusBar
          isMarketOpen={marketStatus.isMarketOpen}
          lastUpdate={lastUpdate}
          onStatusChange={onMarketStatusChange}
        />
      </section>

      {stockList?.length > 0 && (
        <section className="control-section">
          <div className="control-panel">
            <button
              onClick={onToggleAutoRefresh}
              className={`cyber-button ${autoRefreshEnabled ? 'active' : ''}`}
            >
              {autoRefreshEnabled ? '暂停刷新' : '开始刷新'}
            </button>

            <button
              onClick={onManualRefresh}
              className="cyber-button"
              disabled={loading}
            >
              {loading ? '刷新中...' : '立即刷新'}
            </button>

            <div className="interval-selector">
              <label>刷新间隔</label>
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
              <div className="refresh-indicator">
                <div className="refresh-dot"></div>
                <span>
                  {marketStatus.isMarketOpen ? '实时刷新中' : '智能刷新中'}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="decision-section">
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

      {primaryStock && (
        <section className="chart-section">
          <CyberChart
            data={primaryStock}
            title={`${primaryStock.code} 精简K线`}
            height={360}
          />
        </section>
      )}

      {primaryStock && (
        <section className="ai-section">
          <AIDepthAnalysis
            stockCode={primaryStock.code}
            isVip={isVip}
          />
        </section>
      )}

      {error && (
        <section className="error-section">
          <div className="error-container">
            <div className="error-message">错误: {error}</div>
            <button onClick={onManualRefresh} className="cyber-button">
              重试
            </button>
          </div>
        </section>
      )}
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
