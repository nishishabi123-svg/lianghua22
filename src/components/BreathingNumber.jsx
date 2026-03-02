import React, { useState, useEffect, useRef } from 'react';

const BreathingNumber = ({ 
  value, 
  previousValue, 
  prefix = '', 
  suffix = '', 
  precision = 2,
  className = '',
  animationDuration = 600,
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [trend, setTrend] = useState('neutral');
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (previousValue !== undefined && value !== previousValue) {
      setIsAnimating(true);
      
      // 判断涨跌趋势
      if (value > previousValue) {
        setTrend('up');
      } else if (value < previousValue) {
        setTrend('down');
      } else {
        setTrend('neutral');
      }

      // 延迟更新显示值，让动画先执行
      timeoutRef.current = setTimeout(() => {
        setDisplayValue(value);
      }, 50);

      // 清除之前的定时器
      const clearAnimation = setTimeout(() => {
        setIsAnimating(false);
        setTrend('neutral');
      }, animationDuration);

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        clearTimeout(clearAnimation);
      };
    } else {
      setDisplayValue(value);
    }
  }, [value, previousValue, animationDuration]);

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '--';
    return typeof num === 'number' ? num.toFixed(precision) : (Number(num) || 0).toFixed(precision);
  };

  const trendClasses = {
    up: 'trend-up',
    down: 'trend-down',
    neutral: 'trend-neutral'
  };

  return (
    <div 
      className={`breathing-number ${trendClasses[trend]} ${isAnimating ? 'animating' : ''} ${className}`}
      {...props}
    >
      <span className="number-prefix">{prefix}</span>
      <span className="number-value">{formatNumber(displayValue)}</span>
      <span className="number-suffix">{suffix}</span>
      
      <style jsx>{`
        .breathing-number {
          display: inline-block;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .number-value {
          font-weight: bold;
          transition: all 0.3s ease;
        }
        
        .animating .number-value {
          animation: breathing-pulse ${animationDuration}ms ease-in-out;
        }
        
        .trend-up .number-value {
          color: #00ff88 !important;
          text-shadow: 0 0 15px rgba(0, 255, 136, 0.6);
        }
        
        .trend-down .number-value {
          color: #ff4444 !important;
          text-shadow: 0 0 15px rgba(255, 68, 68, 0.6);
        }
        
        .trend-neutral .number-value {
          color: var(--neon-cyan) !important;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        @keyframes breathing-pulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          25% {
            transform: scale(1.05);
            opacity: 1;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
          75% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        /* 涨跌指示器 */
        .trend-up::before,
        .trend-down::before {
          content: '';
          position: absolute;
          top: -8px;
          right: -8px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: indicator-pulse 1s ease-in-out infinite;
        }
        
        .trend-up::before {
          background: #00ff88;
          box-shadow: 0 0 8px rgba(0, 255, 136, 0.8);
        }
        
        .trend-down::before {
          background: #ff4444;
          box-shadow: 0 0 8px rgba(255, 68, 68, 0.8);
        }
        
        @keyframes indicator-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
};

export default BreathingNumber;