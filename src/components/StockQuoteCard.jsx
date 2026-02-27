import React from 'react';
import CyberCard from './CyberCard';
import PriceDisplay from './PriceDisplay';

const StockQuoteCard = ({ stockData, previousData = null }) => {
  if (!stockData) {
    return (
      <CyberCard title="股票行情" neon scanning>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">请输入股票代码查询行情</div>
        </div>
      </CyberCard>
    );
  }

  const formatVolume = (vol) => {
    if (!vol) return '--';
    
    // 转换为手 (除以100)
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
    
    // 如果是完整时间格式，只显示时分
    if (time.includes(':')) {
      return time.substring(0, 5);
    }
    
    return time;
  };

  const currentPrice = stockData.price || stockData.current || 0;
  const previousPrice = previousData?.price || previousData?.current || 0;
  const volume = stockData.vol || stockData.volume || 0;
  const time = stockData.time || '';

  return (
    <CyberCard title={`股票行情 - ${stockData.code}`} neon scanning>
      <div className="stock-quote-grid">
        <div className="quote-main">
          <PriceDisplay
            price={currentPrice}
            previousPrice={previousPrice}
            size="large"
            label="当前价格"
          />
        </div>
        
        <div className="quote-details">
          <div className="quote-item">
            <div className="data-label">成交量</div>
            <div className="data-value volume-value">
              {formatVolume(volume)}
            </div>
          </div>
          
          <div className="quote-item">
            <div className="data-label">更新时间</div>
            <div className="data-value time-value">
              {formatTime(time)}
            </div>
          </div>
          
          <div className="quote-item">
            <div className="data-label">股票代码</div>
            <div className="data-value code-value">
              {stockData.code}
            </div>
          </div>
        </div>
        
        <div className="quote-status">
          <div className={`status-indicator ${currentPrice > previousPrice ? 'up' : currentPrice < previousPrice ? 'down' : 'flat'}`}>
            <div className="status-dot"></div>
            <span className="status-text">
              {currentPrice > previousPrice ? '上涨' : currentPrice < previousPrice ? '下跌' : '平盘'}
            </span>
          </div>
        </div>
      </div>
    </CyberCard>
  );
};

export default StockQuoteCard;