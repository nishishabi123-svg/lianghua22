import React, { useEffect, useMemo, useState } from 'react';
import CyberCard from './CyberCard';

const STRATEGIES = [
  {
    id: 'main-force',
    name: '主力控盘',
    description: '关注资金持续净流入与成交结构改善标的',
    stocks: [
      { code: '000001', price: '12.45', reason: '主力净流入提升，筹码集中度改善', entry: '回踩 12.2 附近分批' },
      { code: '600036', price: '35.67', reason: '机构连续增持，趋势保持完整', entry: '站稳 35.5 再加仓' },
      { code: '000858', price: '142.35', reason: '量价配合顺畅，资金护盘明显', entry: '突破 143 后跟进' }
    ]
  },
  {
    id: 'trend-break',
    name: '趋势共振',
    description: '技术面与情绪面同时回暖的短线机会',
    stocks: [
      { code: '002415', price: '18.90', reason: '均线多头排列，热度回升', entry: '回调 18.5 附近布局' },
      { code: '300750', price: '188.60', reason: '资金回流，板块情绪修复', entry: '放量突破 190 跟进' },
      { code: '601318', price: '44.20', reason: '技术形态确认，风险可控', entry: '守住 44 分批吸纳' }
    ]
  }
];

const getModeByTime = () => {
  const now = new Date();
  const beijingTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (8 * 3600000));
  const minutes = beijingTime.getHours() * 60 + beijingTime.getMinutes();

  if (minutes >= 9 * 60 + 15 && minutes <= 9 * 60 + 30) {
    return {
      label: '早盘必读',
      desc: '聚焦开盘潜伏机会，适合观察资金流向与热点切换。'
    };
  }

  if (minutes >= 14 * 60 + 30 && minutes <= 15 * 60) {
    return {
      label: '尾盘突击',
      desc: '捕捉收盘前确认机会，提前规划次日节奏。'
    };
  }

  return {
    label: '盘中智能',
    desc: '持续跟踪盘中强势股与趋势机会。'
  };
};

const StockSelectionPanel = ({ onSelectStock }) => {
  const [mode, setMode] = useState(getModeByTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setMode(getModeByTime());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const strategies = useMemo(() => STRATEGIES, []);

  return (
    <div className="strategy-section">
      <CyberCard title="时段驱动策略">
        <div className="strategy-mode">
          <div className="mode-title">当前模式</div>
          <div className="mode-value">{mode.label}</div>
          <div className="mode-desc">{mode.desc}</div>
        </div>
      </CyberCard>

      <div className="strategy-grid">
        {strategies.map((strategy) => (
          <CyberCard key={strategy.id} className="strategy-card">
            <div className="strategy-header">
              <div>
                <div className="strategy-title">{strategy.name}</div>
                <div className="strategy-desc">{strategy.description}</div>
              </div>
              <span className="strategy-tag">核心策略</span>
            </div>

            <div className="strategy-table">
              <div className="strategy-row header">
                <span>代码</span>
                <span>现价</span>
                <span>推荐理由</span>
                <span>入场建议</span>
              </div>
              {strategy.stocks.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className="strategy-row"
                  onClick={() => onSelectStock && onSelectStock({ code: item.code })}
                >
                  <span className="row-code">{item.code}</span>
                  <span className="row-price">{item.price}</span>
                  <span className="row-reason">{item.reason}</span>
                  <span className="row-entry">{item.entry}</span>
                </button>
              ))}
            </div>
          </CyberCard>
        ))}
      </div>
    </div>
  );
};

export default StockSelectionPanel;
