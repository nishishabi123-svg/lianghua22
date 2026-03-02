import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { Spin } from 'antd';
import api from '../api';

const KLineChart = ({ symbol, height = 400, period = '日线' }) => {
  const [loading, setLoading] = useState(false);
  const [isMarketClosed, setIsMarketClosed] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState('日线');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const fetchData = useCallback(async () => {
    if (!symbol || symbol === '000000') return;
    setLoading(true);
    setIsMarketClosed(false);
    try {
      // 使用新的实时行情接口 - 扁平化数据读取，根据周期请求不同数据
      const res = await api.get(`/api/stock_realtime?symbol=${encodeURIComponent(symbol)}&period=${currentPeriod}`);
      
      // 检查是否休市
      if (res.status === 'sleep') {
        setIsMarketClosed(true);
        return;
      }
      
      // 直接读取扁平化数据，移除.data嵌套逻辑
      const raw = res?.kline_data ?? [];
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
  }, [symbol, currentPeriod]);

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
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <Spin spinning={loading}>
        <div 
          ref={chartRef} 
          style={{ 
            width: '100%', 
            height: '100%',
            opacity: isMarketClosed ? 0.3 : 1 
          }} 
        />
        {isMarketClosed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-4xl mb-2">😴</div>
              <div className="text-xl font-bold text-gray-600">休市中</div>
              <div className="text-sm text-gray-400 mt-1">交易时间敬请期待</div>
            </div>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default KLineChart;