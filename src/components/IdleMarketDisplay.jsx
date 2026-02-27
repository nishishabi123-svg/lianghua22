import React, { useState, useEffect } from 'react';
import CyberChart from './CyberChart';

const mockIndexData = {
  '000001': { name: '上证指数', klineData: [] },
  '399001': { name: '深证成指', klineData: [] },
  '399006': { name: '创业板指', klineData: [] }
};

const mockLonghuBang = [
  { code: '000688', name: '国城矿业', netInflow: 8234.56, reason: '机构大幅买入' },
  { code: '600036', name: '招商银行', netInflow: -4521.12, reason: '外资减持' },
  { code: '000001', name: '平安银行', netInflow: 3125.89, reason: '北向资金流入' }
];

const mockHotSectors = [
  { name: '新能源汽车', change: 2.34, count: 42, leader: '比亚迪' },
  { name: '半导体', change: 1.85, count: 38, leader: '中芯国际' },
  { name: '光伏', change: 1.23, count: 27, leader: '隆基绿能' }
];

const IdleMarketDisplay = () => {
  const [selectedIndex, setSelectedIndex] = useState('000001');
  const [viewMode, setViewMode] = useState('indices'); // indices, longhu, sectors

  const currentIndex = mockIndexData[selectedIndex];

  return (
    <div className="idle-market-display">
      <div className="idle-header">
        <h3>市场概览</h3>
        <div className="view-tabs">
          <button
            className={`tab-button ${viewMode === 'indices' ? 'active' : ''}`}
            onClick={() => setViewMode('indices')}
          >
            指数K线
          </button>
          <button
            className={`tab-button ${viewMode === 'longhu' ? 'active' : ''}`}
            onClick={() => setViewMode('longhu')}
          >
            龙虎榜
          </button>
          <button
            className={`tab-button ${viewMode === 'sectors' ? 'active' : ''}`}
            onClick={() => setViewMode('sectors')}
          >
            热门板块
          </button>
        </div>
      </div>

      <div className="idle-content">
        {viewMode === 'indices' && (
          <div className="indices-view">
            <div className="index-selector">
              {Object.entries(mockIndexData).map(([code, data]) => (
                <button
                  key={code}
                  className={`index-tab ${selectedIndex === code ? 'active' : ''}`}
                  onClick={() => setSelectedIndex(code)}
                >
                  {data.name}
                </button>
              ))}
            </div>
            <div className="index-chart">
              {currentIndex && (
                <CyberChart
                  data={currentIndex.klineData || []}
                  title={`${currentIndex.name} 实时走势`}
                  height={300}
                />
              )}
            </div>
          </div>
        )}

        {viewMode === 'longhu' && (
          <div className="longhu-view">
            <div className="data-table">
              <div className="table-header">
                <div>股票代码</div>
                <div>股票名称</div>
                <div>净流入(万)</div>
                <div>上榜原因</div>
              </div>
              {mockLonghuBang.map((item) => (
                <div key={item.code} className="table-row">
                  <div className="code">{item.code}</div>
                  <div className="name">{item.name}</div>
                  <div className={`inflow ${item.netInflow > 0 ? 'positive' : 'negative'}`}>
                    {item.netInflow > 0 ? '+' : ''}{item.netInflow.toFixed(2)}
                  </div>
                  <div className="reason">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'sectors' && (
          <div className="sectors-view">
            <div className="sector-grid">
              {mockHotSectors.map((sector, idx) => (
                <div key={idx} className="sector-card">
                  <div className="sector-name">{sector.name}</div>
                  <div className={`sector-change ${sector.change > 0 ? 'positive' : 'negative'}`}>
                    {sector.change > 0 ? '+' : ''}{sector.change.toFixed(2)}%
                  </div>
                  <div className="sector-count">{sector.count}只股票</div>
                  <div className="sector-leader">龙头: {sector.leader}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdleMarketDisplay;