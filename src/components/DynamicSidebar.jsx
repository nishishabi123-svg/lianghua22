import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tabs, Spin, Empty, Tag, Divider, Avatar } from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined, 
  DollarOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined
} from '@ant-design/icons';
import api from '../api';

const { TabPane } = Tabs;

const DynamicSidebar = ({ stockCode, isVisible = true }) => {
  const [stockInfo, setStockInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('holders');

  const fetchStockInfo = useCallback(async () => {
    if (!stockCode || stockCode === '--') return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.get(`/stock_info?symbol=${stockCode}`);
      if (data) {
        setStockInfo(data);
      } else {
        setStockInfo(null);
        setError('暂无个股档案数据');
      }
    } catch (err) {
      console.error('个股档案获取失败:', err);
      setError('个股档案获取失败');
      setStockInfo(null);
    } finally {
      setLoading(false);
    }
  }, [stockCode]);

  useEffect(() => {
    if (isVisible && stockCode) {
      fetchStockInfo();
    }
  }, [stockCode, isVisible, fetchStockInfo]);

  const renderHoldersChanges = () => {
    const holders = stockInfo?.holder_changes || [];
    
    if (holders.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无高管变动数据"
          style={{ padding: '20px' }}
        />
      );
    }

    return (
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {holders.map((holder, index) => {
          const isIncrease = holder.change_type === 'increase';
          const isDecrease = holder.change_type === 'decrease';
          
          return (
            <div key={index} style={{ 
              padding: '12px', 
              borderBottom: '1px solid var(--border-light)',
              background: index % 2 === 0 ? 'transparent' : 'var(--app-background)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <div style={{ marginLeft: '8px' }}>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>
                      {holder.name || holder.holder_name || '--'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {holder.position || holder.title || '--'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    fontWeight: '500'
                  }}>
                    {isIncrease && <RiseOutlined style={{ color: '#52c41a', marginRight: '4px' }} />}
                    {isDecrease && <FallOutlined style={{ color: '#ff4d4f', marginRight: '4px' }} />}
                    <span style={{ 
                      color: isIncrease ? '#52c41a' : isDecrease ? '#ff4d4f' : 'var(--text-muted)'
                    }}>
                      {holder.change_amount || '--'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {holder.change_date || holder.date || '--'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderNewsFeed = () => {
    const news = stockInfo?.news_feed || [];
    
    if (news.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无相关新闻"
          style={{ padding: '20px' }}
        />
      );
    }

    return (
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {news.map((item, index) => (
          <div 
            key={index} 
            style={{ 
              padding: '12px', 
              borderBottom: '1px solid var(--border-light)',
              background: index % 2 === 0 ? 'transparent' : 'var(--app-background)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <FileTextOutlined style={{ 
                color: 'var(--primary-color)', 
                marginTop: '2px',
                marginRight: '8px'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: '500', 
                  fontSize: '14px',
                  marginBottom: '4px',
                  lineHeight: '1.4'
                }}>
                  {item.title || item.headline || '--'}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--text-muted)',
                  marginBottom: '6px'
                }}>
                  {item.summary || item.description || '--'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag size="small" color={item.category === '个股' ? 'blue' : 'green'}>
                    {item.category || item.type || '资讯'}
                  </Tag>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {item.publish_time || item.time || '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDividends = () => {
    const dividends = stockInfo?.dividends || [];
    
    if (dividends.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无分红记录"
          style={{ padding: '20px' }}
        />
      );
    }

    return (
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {dividends.map((item, index) => (
          <div key={index} style={{ 
            padding: '12px', 
            borderBottom: '1px solid var(--border-light)',
            background: index % 2 === 0 ? 'transparent' : 'var(--app-background)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>
                  {item.dividend_year || item.year}年度分红
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {item.record_date || item.date || '--'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <DollarOutlined style={{ marginRight: '4px' }} />
                  {item.dividend_amount || item.amount || '--'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  每10股派送
                </div>
              </div>
            </div>
            
            {item.dividend_type && (
              <div style={{ marginTop: '8px' }}>
                <Tag size="small" color="orange">
                  {item.dividend_type}
                </Tag>
                {item.ex_dividend_date && (
                  <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    除权除息日: {item.ex_dividend_date}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside className="dynamic-sidebar" style={{
      width: '320px',
      marginLeft: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <Card
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '16px',
            fontWeight: '600'
          }}>
            <UserOutlined style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
            个股档案
          </div>
        }
        size="small"
        bodyStyle={{ padding: '0' }}
        style={{ 
          background: '#ffffff',
          boxShadow: 'var(--shadow-soft)',
          borderRadius: '12px'
        }}
      >
        <Spin spinning={loading}>
          {error ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              {error}
            </div>
          ) : (
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              size="small"
              style={{ marginBottom: '0' }}
            >
              <TabPane 
                tab={
                  <span style={{ fontSize: '13px' }}>
                    <UserOutlined style={{ marginRight: '4px' }} />
                    高管动态
                  </span>
                } 
                key="holders"
              >
                {renderHoldersChanges()}
              </TabPane>
              <TabPane 
                tab={
                  <span style={{ fontSize: '13px' }}>
                    <FileTextOutlined style={{ marginRight: '4px' }} />
                    新闻情报
                  </span>
                } 
                key="news"
              >
                {renderNewsFeed()}
              </TabPane>
              <TabPane 
                tab={
                  <span style={{ fontSize: '13px' }}>
                    <DollarOutlined style={{ marginRight: '4px' }} />
                    分红档案
                  </span>
                } 
                key="dividends"
              >
                {renderDividends()}
              </TabPane>
            </Tabs>
          )}
        </Spin>
      </Card>

      {/* 公司基本信息卡片 */}
      {stockInfo?.company_info && (
        <Card
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <CalendarOutlined style={{ marginRight: '6px', color: 'var(--primary-color)' }} />
              公司概况
            </div>
          }
          size="small"
          style={{ 
            background: '#ffffff',
            boxShadow: 'var(--shadow-soft)',
            borderRadius: '12px'
          }}
        >
          <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>公司名称：</span>
              <span style={{ fontWeight: '500' }}>
                {stockInfo.company_info.name || '--'}
              </span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>主营业务：</span>
              <span>{stockInfo.company_info.business || '--'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>注册资本：</span>
              <span>{stockInfo.company_info.capital || '--'}</span>
            </div>
          </div>
        </Card>
      )}
    </aside>
  );
};

export default DynamicSidebar;