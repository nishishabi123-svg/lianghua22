import React, { useMemo, useState } from 'react';

const sentimentMap = {
  positive: { label: '利好', color: 'sentiment-positive', icon: '✅' },
  neutral: { label: '中性', color: 'sentiment-neutral', icon: '⚠️' },
  negative: { label: '利空', color: 'sentiment-negative', icon: '❌' }
};

const AIAccordion = ({ stockCode }) => {
  const [activeId, setActiveId] = useState('fundamentals');

  const analysisDimensions = useMemo(() => ([
    {
      id: 'fundamentals',
      title: '基本面',
      icon: '📊',
      summary: '营收同比增长 30%，盈利能力强劲',
      sentiment: 'positive',
      details: 'EPS: 1.2 元, PE: 15 倍, 净利润: 5 亿元，现金流稳定。'
    },
    {
      id: 'policy',
      title: '政策面',
      icon: '🧭',
      summary: '行业政策持续加码，扩张节奏明确',
      sentiment: 'positive',
      details: '政策扶持资金加速落地，行业景气度维持高位。'
    },
    {
      id: 'technicals',
      title: '技术面',
      icon: '📈',
      summary: '股价突破 20 日均线，形成金叉',
      sentiment: 'positive',
      details: 'MA5: 10.5, MA20: 9.8, MACD: 金叉放量。'
    },
    {
      id: 'capital',
      title: '资金流向',
      icon: '💰',
      summary: '主力资金连续 3 日净流入',
      sentiment: 'positive',
      details: '近三日净流入合计 2.3 亿，大单成交占比提升。'
    },
    {
      id: 'sentiment',
      title: '新闻舆情',
      icon: '📰',
      summary: '舆情偏正面，负面新闻占比下降',
      sentiment: 'neutral',
      details: '正面新闻 65%，负面新闻 12%，社媒热度维持。'
    },
    {
      id: 'global',
      title: '外围影响',
      icon: '🌍',
      summary: '美股企稳，A50 期货维持震荡',
      sentiment: 'neutral',
      details: '纳指短期反弹，外盘波动对内盘影响有限。'
    },
    {
      id: 'confidence',
      title: '大盘信心',
      icon: '🧠',
      summary: '风险偏好温和回升，成交额稳定',
      sentiment: 'positive',
      details: '市场情绪指数 68，成交额维持在 8500 亿以上。'
    }
  ]), []);

  const summary = useMemo(() => ({
    score: 82,
    suggestion: '买入',
    target: '¥ 18.60'
  }), []);

  const scoreTone = summary.score >= 80 ? 'summary-positive' : summary.score >= 60 ? 'summary-neutral' : 'summary-negative';

  return (
    <section className="ai-accordion">
      <div className={`summary-card ${scoreTone}`}>
        <div>
          <div className="summary-title">综合评分</div>
          <div className="summary-score">{summary.score}</div>
        </div>
        <div>
          <div className="summary-title">最终建议</div>
          <div className="summary-suggestion">{summary.suggestion}</div>
        </div>
        <div>
          <div className="summary-title">目标价</div>
          <div className="summary-target">{summary.target}</div>
        </div>
        {stockCode && <div className="summary-code">{stockCode}</div>}
      </div>

      <div className="accordion-list">
        {analysisDimensions.map((item) => {
          const sentiment = sentimentMap[item.sentiment] || sentimentMap.neutral;
          const isOpen = activeId === item.id;

          return (
            <div key={item.id} className={`accordion-item ${isOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className="accordion-header"
                onClick={() => setActiveId(isOpen ? null : item.id)}
              >
                <div className="accordion-title">
                  <span className="accordion-icon">{item.icon}</span>
                  <span>{item.title}</span>
                </div>
                <div className="accordion-summary">{item.summary}</div>
                <div className={`accordion-sentiment ${sentiment.color}`}>
                  <span>{sentiment.icon}</span>
                  <span>{sentiment.label}</span>
                </div>
                <span className="accordion-arrow">{isOpen ? '⌃' : '⌄'}</span>
              </button>
              <div className={`accordion-panel ${isOpen ? 'is-open' : ''}`}>
                <div className="accordion-detail">{item.details}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AIAccordion;
