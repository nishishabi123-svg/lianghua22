import React, { useState, useEffect, useCallback } from 'react';
import CyberCard from './CyberCard';

const MarketStatusBar = ({ isMarketOpen, lastUpdate, onStatusChange }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [beijingTime, setBeijingTime] = useState(new Date());
  const [marketPhase, setMarketPhase] = useState('');

  // 计算市场阶段
  const getMarketPhase = useCallback((date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const day = date.getDay();
    const timeInMinutes = hour * 60 + minute;
    
    // 周末
    if (day === 0 || day === 6) {
      return 'weekend';
    }
    
    // 交易时段
    if (timeInMinutes >= 9 * 60 + 30 && timeInMinutes <= 11 * 60 + 30) {
      return 'morning-session';
    }
    if (timeInMinutes >= 13 * 60 && timeInMinutes <= 15 * 60) {
      return 'afternoon-session';
    }
    
    // 盘前盘后
    if (timeInMinutes >= 9 * 60 && timeInMinutes <= 9 * 60 + 30) {
      return 'pre-market';
    }
    if (timeInMinutes >= 15 * 60 && timeInMinutes <= 15 * 60 + 30) {
      return 'post-market';
    }
    
    // 夜间时段（国际市场）
    if (hour >= 20 || hour <= 6) {
      return 'international-session';
    }
    
    return 'closed';
  }, []);

  // 获取市场状态信息
  const getMarketInfo = useCallback((phase) => {
    const phaseInfo = {
      'weekend': {
        status: 'weekend',
        label: '周末休市',
        color: '#666666',
        description: '市场休市，显示AI分析报告',
        refreshRate: '暂停个股刷新'
      },
      'pre-market': {
        status: 'pre-market',
        label: '盘前准备',
        color: '#ffaa00',
        description: '即将开盘，准备数据',
        refreshRate: '低频更新'
      },
      'morning-session': {
        status: 'open',
        label: '上午交易',
        color: '#00ff88',
        description: '市场开放中',
        refreshRate: '3-5秒高频刷新'
      },
      'afternoon-session': {
        status: 'open',
        label: '下午交易',
        color: '#00ff88',
        description: '市场开放中',
        refreshRate: '3-5秒高频刷新'
      },
      'post-market': {
        status: 'post-market',
        label: '盘后结算',
        color: '#ff6644',
        description: '交易结束，数据处理中',
        refreshRate: '低频更新'
      },
      'international-session': {
        status: 'international',
        label: '国际联动',
        color: '#00ffff',
        description: '关注美股期货、大宗商品',
        refreshRate: '国际数据高频'
      },
      'closed': {
        status: 'closed',
        label: '市场休眠',
        color: '#666666',
        description: '市场休市，显示AI分析报告',
        refreshRate: '暂停个股刷新'
      }
    };

    return phaseInfo[phase] || phaseInfo['closed'];
  }, []);

  // 更新时间
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      
      // 转换为北京时间
      const beijing = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (8 * 3600000));
      setBeijingTime(beijing);
      
      const phase = getMarketPhase(beijing);
      setMarketPhase(phase);
      
      // 通知父组件状态变化
      if (onStatusChange) {
        const marketOpen = ['morning-session', 'afternoon-session'].includes(phase);
        onStatusChange({
          isMarketOpen: marketOpen,
          phase,
          beijingTime
        });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [getMarketPhase, onStatusChange]);

  const marketInfo = getMarketInfo(marketPhase);

  return (
    <CyberCard className="market-status-bar">
      <div className="status-content">
        <div className="status-left">
          <div className="market-status">
            <div 
              className="status-indicator"
              style={{ 
                backgroundColor: marketInfo.color,
                boxShadow: `0 0 15px ${marketInfo.color}88`
              }}
            ></div>
            <div className="status-info">
              <div className="status-label">{marketInfo.label}</div>
              <div className="status-description">{marketInfo.description}</div>
            </div>
          </div>
          
          <div className="time-display">
            <div className="beijing-time">
              <span className="time-label">北京时间:</span>
              <span className="time-value">
                {beijingTime.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
            <div className="time-details">
              {beijingTime.toLocaleDateString('zh-CN', {
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
          </div>
        </div>
        
        <div className="status-right">
          <div className="refresh-info">
            <div className="refresh-rate">
              <span className="refresh-label">刷新频率:</span>
              <span className="refresh-value">{marketInfo.refreshRate}</span>
            </div>
            {lastUpdate && (
              <div className="last-update">
                <span className="update-label">最后更新:</span>
                <span className="update-value">
                  {lastUpdate.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
          
          <div className="phase-indicators">
            {['morning-session', 'afternoon-session'].includes(marketPhase) && (
              <div className="trading-indicator">
                <div className="pulse-dot"></div>
                <span>实时交易中</span>
              </div>
            )}
            {marketPhase === 'international-session' && (
              <div className="international-indicator">
                <div className="globe-dot"></div>
                <span>国际市场</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 进度条显示交易时段 */}
      <div className="session-progress">
        <div className="progress-bar">
          {marketPhase === 'morning-session' && (
            <div 
              className="progress-fill morning"
              style={{ 
                width: `${((beijingTime.getHours() * 60 + beijingTime.getMinutes() - 570) / 120) * 100}%` 
              }}
            ></div>
          )}
          {marketPhase === 'afternoon-session' && (
            <div 
              className="progress-fill afternoon"
              style={{ 
                width: `${((beijingTime.getHours() * 60 + beijingTime.getMinutes() - 780) / 120) * 100}%` 
              }}
            ></div>
          )}
        </div>
        <div className="session-labels">
          <span>09:30</span>
          <span>11:30</span>
          <span>13:00</span>
          <span>15:00</span>
        </div>
      </div>
    </CyberCard>
  );
};

export default MarketStatusBar;