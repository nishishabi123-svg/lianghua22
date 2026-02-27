import React from 'react';
import StockSelectionPanel from '../components/StockSelectionPanel';
import CyberCard from '../components/CyberCard';

const StrategyPage = () => {
  return (
    <div className="page-container strategy-page">
      <section className="page-header">
        <h2>每日策略选股</h2>
        <p>聚焦主力控盘与趋势共振策略，帮助你快速定位当日潜在机会。</p>
      </section>

      <CyberCard className="strategy-mode-card">
        <div className="strategy-mode">
          <div className="mode-title">当前模式</div>
          <div className="mode-value">盘中智能跟踪</div>
          <div className="mode-desc">系统会在指定时段切换为早盘必读或尾盘突击。</div>
        </div>
      </CyberCard>

      <StockSelectionPanel onSelectStock={() => {}} />
    </div>
  );
};

export default StrategyPage;
