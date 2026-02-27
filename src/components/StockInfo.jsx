import React from 'react';
import { Card, Row, Col, Statistic, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const StockInfo = ({ stockInfo, quote }) => {
  if (!stockInfo && !quote) {
    return (
      <Card title="股票信息">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          请先搜索并选择股票
        </div>
      </Card>
    );
  }

  const changePercent = quote?.change || 0;
  const isPositive = changePercent >= 0;

  return (
    <Card title={stockInfo?.name || quote?.symbol || '股票信息'}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Statistic
            title="股票代码"
            value={quote?.symbol || '--'}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="当前价格"
            value={quote?.current || '--'}
            precision={2}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="涨跌幅"
            value={changePercent}
            precision={2}
            valueStyle={{ color: isPositive ? '#3f8600' : '#cf1322' }}
            prefix={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            suffix="%"
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="成交量"
            value={quote?.volume || '--'}
            formatter={(value) => {
              if (!value) return '--';
              if (value >= 100000000) {
                return `${(value / 100000000).toFixed(2)}亿`;
              } else if (value >= 10000) {
                return `${(value / 10000).toFixed(2)}万`;
              }
              return value;
            }}
          />
        </Col>
      </Row>

      {stockInfo && (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={8}>
            <Card size="small" title="基本信息">
              <p><strong>行业:</strong> {stockInfo.industry || '--'}</p>
              <p><strong>市值:</strong> {stockInfo.market_cap || '--'}</p>
              <p><strong>流通市值:</strong> {stockInfo.float_market_cap || '--'}</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="财务指标">
              <p><strong>市盈率:</strong> {stockInfo.pe || '--'}</p>
              <p><strong>市净率:</strong> {stockInfo.pb || '--'}</p>
              <p><strong>ROE:</strong> {stockInfo.roe || '--'}</p>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="技术指标">
              <Tag color="blue">52周最高: {stockInfo.week_52_high || '--'}</Tag>
              <br /><br />
              <Tag color="blue">52周最低: {stockInfo.week_52_low || '--'}</Tag>
            </Card>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default StockInfo;