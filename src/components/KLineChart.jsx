import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { Card, Spin, Select, Button, Tooltip } from 'antd';
import { ReloadOutlined, FullscreenOutlined } from '@ant-design/icons';
import api from '../api';

const { Option } = Select;

const KLineChart = ({ stockCode, title = "K线图", height = 400, data }) => {
  const [klineData, setKlineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('5y'); // 默认5年
  const [displayCount, setDisplayCount] = useState(200); // 首屏显示200条
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // 将外部传入的 10 日数据转换为 K 线结构
  const normalizeExternalData = useCallback((externalList = []) => {
    return externalList.map((item) => {
      const closePrice = item.close_price ?? item.close ?? item.price ?? 0;
      return {
        date: item.date,
        open: item.open ?? closePrice,
        close: item.close ?? closePrice,
        low: item.low ?? closePrice,
        high: item.high ?? closePrice
      };
    });
  }, []);

  // 获取K线数据（外部 data 有值时不请求接口）
  const fetchKlineData = useCallback(async (periodValue = period) => {
    if (Array.isArray(data) && data.length > 0) return;
    if (!stockCode || stockCode === '--') return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/kline?symbol=${stockCode}&period=${periodValue}`);

      if (response && response.klines) {
        // 首屏只显示最近200条，但存储全部数据用于DataZoom
        const recentData = response.klines.slice(-displayCount);
        setKlineData({
          allData: response.klines,
          displayData: recentData,
          total: response.klines.length
        });
      } else {
        setKlineData(null);
        setError('暂无K线数据');
      }
    } catch (err) {
      console.error('K线数据获取失败:', err);
      setError('K线数据获取失败');
      setKlineData(null);
    } finally {
      setLoading(false);
    }
  }, [stockCode, period, displayCount, data]);

  // 优先使用外部传入的 10 日数据
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const normalized = normalizeExternalData(data);
      const recentData = normalized.slice(-displayCount);
      setKlineData({
        allData: normalized,
        displayData: recentData,
        total: normalized.length
      });
      setError(null);
      setLoading(false);
    }
  }, [data, displayCount, normalizeExternalData]);

  // 初始数据加载（无外部数据时）
  useEffect(() => {
    fetchKlineData();
  }, [fetchKlineData]);

  useEffect(() => {
    if (!chartRef.current || !klineData || klineData.displayData.length === 0) return;

    // 初始化图表
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // 使用全部数据准备K线，但首屏只显示部分
    const allKlineData = klineData.allData.map(item => [
      item.open,    // 开盘价
      item.close,   // 收盘价
      item.low,     // 最低价
      item.high     // 最高价
    ]);

    const xData = klineData.allData.map(item => item.date || item.time);
    const zoomStart = klineData.total > 0
      ? Math.max(0, ((klineData.total - displayCount) / klineData.total) * 100)
      : 0;

    const option = {
      title: {
        text: title,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: function (params) {
          const point = params[0];
          const values = point.value;
          return `
            <div>
              <strong>${point.name}</strong><br/>
              开盘: ${values[0]}<br/>
              收盘: ${values[1]}<br/>
              最低: ${values[2]}<br/>
              最高: ${values[3]}
            </div>
          `;
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: xData,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: zoomStart,
          end: 100,
          minValueSpan: 50 // 最小显示50条数据
        },
        {
          show: true,
          type: 'slider',
          top: '90%',
          start: zoomStart,
          end: 100,
          minValueSpan: 50,
          rangeMode: ['percent', 'percent']
        }
      ],
      series: [
        {
          name: 'K线',
          type: 'candlestick',
          data: allKlineData,
          itemStyle: {
            color: '#ec0000',
            color0: '#00da3c',
            borderColor: '#8A0000',
            borderColor0: '#008F28'
          }
        }
      ]
    };

    chartInstance.current.setOption(option);

    // 响应式处理
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [klineData, title, displayCount]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  const handlePeriodChange = (value) => {
    setPeriod(value);
    fetchKlineData(value);
  };

  const handleRefresh = () => {
    fetchKlineData();
  };

  const handleFullscreen = () => {
    if (chartInstance.current) {
      // 简单的全屏实现
      const chartDom = chartInstance.current.getDom();
      if (chartDom.requestFullscreen) {
        chartDom.requestFullscreen();
      }
    }
  };

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
            {error}
          </div>
          <Button type="primary" onClick={handleRefresh}>
            重新加载
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '16px', fontWeight: '600' }}>
            {stockCode} {title}
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Select
              value={period}
              onChange={handlePeriodChange}
              style={{ width: '100px' }}
              size="small"
            >
              <Option value="1m">1月</Option>
              <Option value="3m">3月</Option>
              <Option value="6m">6月</Option>
              <Option value="1y">1年</Option>
              <Option value="3y">3年</Option>
              <Option value="5y">5年</Option>
            </Select>
            <Tooltip title="刷新数据">
              <Button
                icon={<ReloadOutlined />}
                size="small"
                onClick={handleRefresh}
                loading={loading}
              />
            </Tooltip>
            <Tooltip title="全屏查看">
              <Button
                icon={<FullscreenOutlined />}
                size="small"
                onClick={handleFullscreen}
              />
            </Tooltip>
          </div>
        </div>
      }
      bodyStyle={{ padding: '16px' }}
      style={{
        background: '#ffffff',
        boxShadow: 'var(--shadow-soft)',
        borderRadius: '12px'
      }}
    >
      <Spin spinning={loading}>
        <div
          ref={chartRef}
          style={{ width: '100%', height: `${height}px` }}
        />
        {klineData && (
          <div style={{
            textAlign: 'center',
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            显示最近 {klineData.displayData.length} 条，共 {klineData.total} 条数据
            {period === '5y' && ' · 支持拖动缩放查看完整5年历史'}
          </div>
        )}
        {!klineData && !loading && (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            暂无K线数据
          </div>
        )}
      </Spin>
    </Card>
  );
};

export default KLineChart;
