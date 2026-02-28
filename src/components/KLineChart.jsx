import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { Spin } from 'antd';
import api from '../api';

const KLineChart = ({ symbol, height = 400 }) => {
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const fetchData = useCallback(async () => {
    if (!symbol || symbol === '000000') return;
    setLoading(true);
    try {
      // 必须调用包含 K线数据的完整报告接口
      const res = await api.get(`/api/stock_full_report?symbol=${encodeURIComponent(symbol)}`);
      const payload = res?.data ?? res;
      const raw =
        payload?.kline_data ??
        payload?.data?.kline_data ??
        payload?.data?.data?.kline_data ??
        payload?.kline ??
        [];
      const { dates, data } = normalizeKlineData(raw);

      if (data.length) {
        renderChart(dates, data);
      } else {
        console.warn('K线数据为空或格式异常', raw);
      }
    } catch (e) {
      console.error('K线加载失败', e);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const renderChart = (dates, data) => {
    if (!chartInstance.current) chartInstance.current = echarts.init(chartRef.current);
    chartInstance.current.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      grid: { left: '10%', right: '5%', bottom: '15%' },
      xAxis: { type: 'category', data: dates, scale: true, boundaryGap: false },
      yAxis: { scale: true, splitArea: { show: true } },
      dataZoom: [{ type: 'inside', start: 50, end: 100 }, { type: 'slider', start: 50, end: 100 }],
      series: [{ type: 'candlestick', data: data, itemStyle: { color: '#ef5350', color0: '#26a69a' } }]
    });
  };

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const resize = () => chartInstance.current?.resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <Spin spinning={loading}>
      <div ref={chartRef} style={{ width: '100%', height: `${height}px` }} />
    </Spin>
  );
};

export default KLineChart;