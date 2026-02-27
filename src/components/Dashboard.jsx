import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Statistic, Alert } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import SearchStock from './SearchStock';
import StockInfo from './StockInfo';
import KLineChart from './KLineChart';
import { getQuote, getStockInfo, getKlineData, getMarketSentiment } from '../api/stock';

const { Content } = Layout;

const Dashboard = () => {
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);
  const [quote, setQuote] = useState(null);
  const [klineData, setKlineData] = useState([]);
  const [marketSentiment, setMarketSentiment] = useState(null);
  const [loading, setLoading] = useState(false);

  // 获取市场情绪数据
  useEffect(() => {
    const fetchMarketSentiment = async () => {
      try {
        const result = await getMarketSentiment();
        if (result.success) {
          setMarketSentiment(result.data);
        }
      } catch (error) {
        console.error('获取市场情绪失败:', error);
      }
    };

    fetchMarketSentiment();
    
    // 每30秒更新一次市场情绪
    const interval = setInterval(fetchMarketSentiment, 30000);
    return () => clearInterval(interval);
  }, []);

  // 处理股票选择
  const handleStockSelect = async (stock) => {
    setSelectedStock(stock);
    setLoading(true);
    
    try {
      // 并发获取股票数据
      const [quoteResult, infoResult, klineResult] = await Promise.all([
        getQuote(stock.symbol),
        getStockInfo(stock.symbol),
        getKlineData(stock.symbol)
      ]);

      if (quoteResult.success) {
        setQuote(quoteResult.data);
      }

      if (infoResult.success) {
        setStockInfo(infoResult.data);
      }

      if (klineResult.success) {
        setKlineData(klineResult.data || []);
      }
    } catch (error) {
      console.error('获取股票数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Row gutter={[16, 16]}>
          {/* 搜索组件 */}
          <Col span={24}>
            <SearchStock onStockSelect={handleStockSelect} />
          </Col>

          {/* 市场情绪概览 */}
          {marketSentiment && (
            <Col span={24}>
              <Alert
                message="市场情绪"
                description={`当前市场情绪: ${marketSentiment.sentiment || '中性'}, 
                          涨停家数: ${marketSentiment.limit_up || 0}, 
                          跌停家数: ${marketSentiment.limit_down || 0}`}
                type={marketSentiment.sentiment === '积极' ? 'success' : 
                      marketSentiment.sentiment === '消极' ? 'error' : 'info'}
                showIcon
              />
            </Col>
          )}

          {/* 股票基本信息 */}
          <Col span={24}>
            <StockInfo stockInfo={stockInfo} quote={quote} />
          </Col>

          {/* K线图 */}
          <Col span={24}>
            <KLineChart 
              data={klineData} 
              title={`${selectedStock?.name || selectedStock?.symbol || '股票'} K线图`}
              height={500}
            />
          </Col>

          {/* 市场统计 */}
          <Col span={6}>
            <Card>
              <Statistic
                title="上证指数"
                value={3125.87}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<ArrowUpOutlined />}
                suffix="+0.87%"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="深证成指"
                value={10456.32}
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ArrowDownOutlined />}
                suffix="-0.45%"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="创业板指"
                value={1987.65}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<ArrowUpOutlined />}
                suffix="+1.23%"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="科创50"
                value={876.54}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<ArrowUpOutlined />}
                suffix="+0.67%"
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Dashboard;