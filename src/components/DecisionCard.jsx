import React, { useEffect, useMemo, useState, memo } from 'react';
import CyberCard from './CyberCard';
import api from '../api';

const DecisionCard = ({ stockData, isVip }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const code = stockData?.code || '--';
  const price = stockData?.price ?? stockData?.current ?? '--';
  const change = stockData?.change ?? stockData?.change_pct ?? stockData?.pct ?? 0;
  const amount = stockData?.amount ?? stockData?.turnover ?? stockData?.成交额 ?? '--';
  const turnover = stockData?.turnover_rate ?? stockData?.turnoverRate ?? stockData?.换手率 ?? '--';

  const summaryText = useMemo(() => {
    if (!analysis?.summary) return '--';
    return analysis.summary;
  }, [analysis]);

  const coreLogic = useMemo(() => {
    if (analysis?.core_logic) return analysis.core_logic;
    if (analysis?.dimensions?.technical) return analysis.dimensions.technical;
    return 'AI 正在生成核心结论。';
  }, [analysis]);

  const changeValue = Number(change) || 0;
  const changeDisplay = Number.isNaN(changeValue) ? '--' : `${changeValue >= 0 ? '+' : ''}${changeValue.toFixed(2)}%`;

  useEffect(() => {
    if (!code || code === '--') return;

    setLoading(true);
    api.get(`/ai_analysis?symbol=${code}`)
      .then((data) => {
        if (data && data.summary) {
          setAnalysis(data);
        }
      })
      .catch((err) => {
        console.error('AI 决策获取失败:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [code]);

  return (
    <CyberCard className="decision-card">
      <div className="decision-card__header">
        <span className="decision-code">{code}</span>
        <span className={`decision-change ${changeValue >= 0 ? 'up' : 'down'}`}>
          {changeDisplay}
        </span>
      </div>

      <div className="decision-card__body">
        <div className="decision-quote">
          <div className="quote-price">{price}</div>
          <div className="quote-metrics">
            <span>成交额 {amount}</span>
            <span>换手率 {turnover}</span>
          </div>
        </div>

        <div className="decision-ai">
          <div className="decision-tag">AI 决策</div>
          <div className="decision-summary">{summaryText}</div>
          <div className="decision-logic">
            {loading ? 'AI 正在决策中...' : coreLogic}
          </div>
        </div>

        <div className="decision-plan">
          <div className="decision-tag">操盘计划</div>
          {isVip && analysis?.trade_plan ? (
            <ul className="plan-list">
              <li>入场点：{analysis.trade_plan.entry}</li>
              <li>止损位：{analysis.trade_plan.stop_loss}</li>
              <li>目标价：{analysis.trade_plan.target}</li>
              <li>建议仓位：{analysis.trade_plan.position ?? '三成仓'}</li>
            </ul>
          ) : (
            <div className="plan-locked">开通 VIP 解锁精确点位与仓位建议</div>
          )}
        </div>
      </div>
    </CyberCard>
  );
};

export default memo(DecisionCard);
