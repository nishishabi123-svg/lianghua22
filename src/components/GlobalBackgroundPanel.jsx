import React, { useState, useEffect, useCallback } from 'react';
import CyberCard from './CyberCard';
import BreathingNumber from './BreathingNumber';

const GlobalBackgroundPanel = ({ stockCode, stockData }) => {
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 模拟全球数据
  const mockGlobalData = {
    usMarket: {
      nasdaq100: { value: 15832.45, change: 1.25, changePercent: 0.79 },
      sp500: { value: 4521.68, change: -12.34, changePercent: -0.27 },
      dowJones: { value: 35432.12, change: 89.45, changePercent: 0.25 }
    },
    commodities: {
      gold: { value: 1987.50, change: 15.30, changePercent: 0.78, unit: 'USD/oz' },
      oil: { value: 82.45, change: -1.25, changePercent: -1.49, unit: 'USD/bbl' },
      copper: { value: 3.82, change: 0.05, changePercent: 1.32, unit: 'USD/lb' }
    },
    currencies: {
      dxy: { value: 104.25, change: -0.35, changePercent: -0.33, unit: '指数' },
      usdcnh: { value: 7.2856, change: -0.0156, changePercent: -0.21, unit: '离岸人民币' },
      eurusd: { value: 1.0845, change: 0.0034, changePercent: 0.31, unit: 'EUR/USD' }
    },
    crypto: {
      bitcoin: { value: 43256.78, change: 1256.45, changePercent: 2.99, unit: 'USD' },
      ethereum: { value: 2245.67, change: 45.32, changePercent: 2.06, unit: 'USD' }
    },
    correlations: {
      usMarket: 0.65,
      commodities: 0.32,
      currencies: 0.28
    }
  };

  // 获取全球数据
  const fetchGlobalData = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGlobalData(mockGlobalData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('获取全球数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalData();
    
    // 国际市场时段高频刷新
    const interval = setInterval(fetchGlobalData, 10000); // 10秒刷新
    return () => clearInterval(interval);
  }, [fetchGlobalData]);

  // 数值显示组件
  const GlobalDataItem = ({ label, data, icon, color = '#00ffff' }) => {
    const isPositive = data.changePercent >= 0;
    
    return (
      <div className="global-data-item" style={{ borderLeftColor: color }}>
        <div className="global-data-header">
          <span className="global-data-icon">{icon}</span>
          <span className="global-data-label">{label}</span>
        </div>
        <div className="global-data-value">
          <BreathingNumber 
            value={data.value} 
            precision={data.unit && data.unit.includes('USD') && !data.unit.includes('指数') ? 2 : 0}
          />
          <span className="global-data-unit">{data.unit}</span>
        </div>
        <div className={`global-data-change ${isPositive ? 'positive' : 'negative'}`}>
          <span className="change-arrow">
            {isPositive ? '↑' : '↓'}
          </span>
          <BreathingNumber 
            value={Math.abs(data.change)} 
            precision={2}
            previousValue={0}
          />
          <span className="change-percent">
            ({isPositive ? '+' : ''}{Number(data.changePercent || 0).toFixed(2)}%)
          </span>
        </div>
      </div>
    );
  };

  if (!globalData) {
    return (
      <CyberCard title="全球背景板" className="global-panel">
        <div className="loading-global">
          <div className="loading-spinner"></div>
          <div className="loading-text">正在获取全球市场数据...</div>
        </div>
      </CyberCard>
    );
  }

  return (
    <div className="global-background-section">
      <div className="global-header">
        <CyberCard className="global-status-card">
          <div className="global-status">
            <h3>全球市场联动监测</h3>
            <div className="last-update-time">
              最后更新: {lastUpdate?.toLocaleTimeString('zh-CN')}
            </div>
          </div>
        </CyberCard>
      </div>

      <div className="global-markets-grid">
        {/* 美股市场 */}
        <CyberCard title="美股期货" className="global-section us-markets">
          <div className="global-data-grid">
            <GlobalDataItem 
              label="纳斯达克100" 
              data={globalData.usMarket.nasdaq100} 
              icon="📈"
              color="#00ff88"
            />
            <GlobalDataItem 
              label="标普500" 
              data={globalData.usMarket.sp500} 
              icon="📊"
              color="#00ffff"
            />
            <GlobalDataItem 
              label="道琼斯" 
              data={globalData.usMarket.dowJones} 
              icon="💹"
              color="#ff00ff"
            />
          </div>
        </CyberCard>

        {/* 大宗商品 */}
        <CyberCard title="大宗商品" className="global-section commodities">
          <div className="global-data-grid">
            <GlobalDataItem 
              label="伦敦金" 
              data={globalData.commodities.gold} 
              icon="🥇"
              color="#ffd700"
            />
            <GlobalDataItem 
              label="布伦特原油" 
              data={globalData.commodities.oil} 
              icon="🛢️"
              color="#ff6b35"
            />
            <GlobalDataItem 
              label="铜" 
              data={globalData.commodities.copper} 
              icon="⚡"
              color="#ff8c00"
            />
          </div>
        </CyberCard>

        {/* 外汇市场 */}
        <CyberCard title="外汇市场" className="global-section currencies">
          <div className="global-data-grid">
            <GlobalDataItem 
              label="美元指数" 
              data={globalData.currencies.dxy} 
              icon="💵"
              color="#00a652"
            />
            <GlobalDataItem 
              label="离岸人民币" 
              data={globalData.currencies.usdcnh} 
              icon="🇨🇳"
              color="#ff0000"
            />
            <GlobalDataItem 
              label="欧元美元" 
              data={globalData.currencies.eurusd} 
              icon="🇪🇺"
              color="#003399"
            />
          </div>
        </CyberCard>

        {/* 加密货币 */}
        <CyberCard title="加密货币" className="global-section crypto">
          <div className="global-data-grid">
            <GlobalDataItem 
              label="比特币" 
              data={globalData.crypto.bitcoin} 
              icon="₿"
              color="#f7931a"
            />
            <GlobalDataItem 
              label="以太坊" 
              data={globalData.crypto.ethereum} 
              icon="Ξ"
              color="#627eea"
            />
          </div>
        </CyberCard>
      </div>

      {/* 关联性分析 */}
      {stockCode && (
        <CyberCard title={`${stockCode} 国际关联性分析`} className="correlation-analysis">
          <div className="correlation-content">
            <div className="correlation-grid">
              <div className="correlation-item">
                <div className="correlation-label">美股关联度</div>
                <div className="correlation-value">
                  <BreathingNumber value={globalData.correlations.usMarket * 100} suffix="%" />
                </div>
                <div className="correlation-bar">
                  <div 
                    className="correlation-fill"
                    style={{ width: `${globalData.correlations.usMarket * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="correlation-item">
                <div className="correlation-label">大宗商品关联度</div>
                <div className="correlation-value">
                  <BreathingNumber value={globalData.correlations.commodities * 100} suffix="%" />
                </div>
                <div className="correlation-bar">
                  <div 
                    className="correlation-fill commodities"
                    style={{ width: `${globalData.correlations.commodities * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="correlation-item">
                <div className="correlation-label">外汇关联度</div>
                <div className="correlation-value">
                  <BreathingNumber value={globalData.correlations.currencies * 100} suffix="%" />
                </div>
                <div className="correlation-bar">
                  <div 
                    className="correlation-fill currencies"
                    style={{ width: `${globalData.correlations.currencies * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="correlation-insight">
              <h4>关联性洞察</h4>
              <div className="insight-content">
                {globalData.correlations.usMarket > 0.6 && (
                  <div className="insight-item">
                    <span className="insight-icon">🔗</span>
                    <span className="insight-text">与美股高度相关，需关注美联储政策动向</span>
                  </div>
                )}
                {globalData.correlations.commodities > 0.3 && (
                  <div className="insight-item">
                    <span className="insight-icon">🛢️</span>
                    <span className="insight-text">受大宗商品价格影响，关注通胀数据</span>
                  </div>
                )}
                {globalData.correlations.currencies > 0.3 && (
                  <div className="insight-item">
                    <span className="insight-icon">💱</span>
                    <span className="insight-text">汇率波动影响显著，关注人民币走势</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CyberCard>
      )}
    </div>
  );
};

export default GlobalBackgroundPanel;