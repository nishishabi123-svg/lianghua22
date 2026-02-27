import React, { memo, useMemo, useCallback } from 'react';
import CyberCard from './CyberCard';
import PriceDisplay from './PriceDisplay';

const OptimizedStockDisplay = memo(({ stockData, previousData }) => {
  // 使用 useMemo 优化格式化计算
  const formattedData = useMemo(() => {
    if (!stockData) return null;

    const formatVolume = (vol) => {
      if (!vol) return '--';
      const hands = vol / 100;
      if (hands >= 10000) {
        return `${(hands / 10000).toFixed(1)}万手`;
      } else if (hands >= 1000) {
        return `${(hands / 1000).toFixed(1)}千手`;
      } else {
        return `${hands.toFixed(0)}手`;
      }
    };

    const formatTime = (time) => {
      if (!time) return '--';
      if (time.includes(':')) {
        return time.substring(0, 5);
      }
      return time;
    };

    const currentPrice = stockData.price || stockData.current || 0;
    const previousPrice = previousData?.price || previousData?.current || 0;
    const volume = stockData.vol || stockData.volume || 0;
    const time = stockData.time || '';
    const code = stockData.code || '';

    return {
      currentPrice,
      previousPrice,
      volume: formatVolume(volume),
      time: formatTime(time),
      code,
      priceChange: currentPrice - previousPrice,
      priceChangePercent: previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0,
      status: currentPrice > previousPrice ? 'up' : currentPrice < previousPrice ? 'down' : 'flat'
    };
  }, [stockData, previousData]);

  if (!formattedData) {
    return (
      <CyberCard title="股票行情" neon scanning>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">请输入股票代码查询行情</div>
        </div>
      </CyberCard>
    );
  }

  return (
    <CyberCard title={`股票行情 - ${formattedData.code}`} neon scanning>
      <div className="stock-quote-grid">
        <div className="quote-main">
          <PriceDisplay
            price={formattedData.currentPrice}
            previousPrice={formattedData.previousPrice}
            size="large"
            label="当前价格"
          />
        </div>
        
        <div className="quote-details">
          <div className="quote-item">
            <div className="data-label">成交量</div>
            <div className="data-value volume-value">
              {formattedData.volume}
            </div>
          </div>
          
          <div className="quote-item">
            <div className="data-label">更新时间</div>
            <div className="data-value time-value">
              {formattedData.time}
            </div>
          </div>
          
          <div className="quote-item">
            <div className="data-label">股票代码</div>
            <div className="data-value code-value">
              {formattedData.code}
            </div>
          </div>
          
          <div className="quote-item">
            <div className="data-label">涨跌幅</div>
            <div className={`data-value change-value ${formattedData.status}`}>
              {formattedData.priceChangePercent >= 0 ? '+' : ''}{formattedData.priceChangePercent.toFixed(2)}%
            </div>
          </div>
        </div>
        
        <div className="quote-status">
          <div className={`status-indicator ${formattedData.status}`}>
            <div className="status-dot"></div>
            <span className="status-text">
              {formattedData.status === 'up' ? '上涨' : 
               formattedData.status === 'down' ? '下跌' : '平盘'}
            </span>
          </div>
        </div>
      </div>
    </CyberCard>
  );
});

OptimizedStockDisplay.displayName = 'OptimizedStockDisplay';

export default OptimizedStockDisplay;