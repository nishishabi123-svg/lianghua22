import React, { useEffect, useState } from 'react';

const PriceDisplay = ({ 
  price, 
  previousPrice = null,
  size = 'large',
  showChange = true,
  label = '',
  className = '',
  ...props 
}) => {
  const [currentPrice, setCurrentPrice] = useState(price);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (previousPrice !== null && price !== previousPrice) {
      setIsFlashing(true);
      setCurrentPrice(price);
      
      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [price, previousPrice]);

  const change = previousPrice !== null ? price - previousPrice : 0;
  const changePercent = previousPrice !== null ? ((change / previousPrice) * 100) : 0;
  const isPositive = change >= 0;

  const sizeClasses = {
    small: 'price-small',
    medium: 'price-medium',
    large: 'price-large'
  };

  return (
    <div className={`price-display ${sizeClasses[size]} ${className}`} {...props}>
      {label && <div className="data-label">{label}</div>}
      <div className={`price-value ${isFlashing ? 'price-flash' : ''}`}>
        ¥{currentPrice?.toFixed(2) || '--'}
      </div>
      {showChange && previousPrice !== null && (
        <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '↑' : '↓'} 
          {Math.abs(change).toFixed(2)} 
          ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;