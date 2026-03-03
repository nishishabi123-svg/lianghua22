import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { Spin } from 'antd';
import api from '../api';

// ✅ 数据标准化函数
const normalizeKlineData = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) return { dates: [], data: [] };
  
  const dates = [];
  const data = [];
  
  rawData.forEach(item => {
    if (Array.isArray(item) && item.length >= 5) {
      const open = parseFloat(item[1]);
      const close = parseFloat(item[2]);
      const val3 = parseFloat(item[3]);
      const val4 = parseFloat(item[4]);
      
      const high = Math.max(val3, val4);
      const low = Math.min(val3, val4);
      const vol = item.length > 5 ? parseFloat(item[5]) : 0;

      dates.push(String(item[0]));
      // ECharts: [开盘，收盘，最低，最高，成交量]
      data.push([open, close, low, high, vol]);
    }
  });
  
  return { dates, data };
};

const KLineChart = ({ symbol, height = 400, period = '日线' }) => {
  const [loading, setLoading] = useState(false);
  const [isMarketClosed, setIsMarketClosed] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    if (symbol === '000000') return;
    
    setLoading(true);
    setIsMarketClosed(false);
    
    try {
      const res = await api.get(`/api/stock_realtime?symbol=${encodeURIComponent(symbol)}`);
      console.log('K 线接口返回:', res);
      
      if (res.status === 'sleep') {
        setIsMarketClosed(true);
        return;
      }
      
      const raw = res?.kline_data || res?.klines || res?.data || [];
      const { dates, data } = normalizeKlineData(raw);

      if (data.length) {
        renderChart(dates, data);
      } else {
        console.warn('K 线数据为空或格式异常', raw);
      }
    } catch (e) {
      console.error('K 线加载失败', e);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const renderChart = (dates, data) => {
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }
    
    // ✅ 修复：确保 setOption 完整闭合
    chartInstance.current.setOption({
      tooltip: { 
        trigger: 'axis', 
        axisPointer: { type: 'cross' },
        formatter: function (params) {
          const p = params[0];
          return `日期：${p.name}<br/>开盘：${p.data[0]}<br/>收盘：${p.data[1]}<br/>最低：${p.data[2]}<br/>最高：${p.data[3]}`;
        }
      },
      grid: { 
        left: '10%', 
        right: '5%', 
        bottom: '15%', 
        top: '10%',
        containLabel: true 
      },
      xAxis: { 
        type: 'category', 
        data: dates, 
        scale: true, 
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: true, lineStyle: { color: '#eee' } }
      },
      yAxis: { 
        scale: true, 
        splitArea: { show: false },
        position: 'right',
        axisLabel: {
          formatter: '{value}',
          fontSize: 10,
          color: '#666'
        },
        splitLine: { show: true, lineStyle: { color: '#eee', type: 'dashed' } }
      },
      dataZoom: [
        { type: 'inside', start: 50, end: 100, minValueSpan: 10 }, 
        { type: 'slider', start: 50, end: 100, bottom: 10, height: 20 }
      ],
      series: [{ 
        type: 'candlestick', 
        data: data, 
        barWidth: '60%',
        itemStyle: { 
          color: '#ef5350',
          color0: '#26a69a',
          borderColor: '#ef5350',
          borderColor0: '#26a69a',
          borderWidth: 1
        }
      }]
    }); // 👈 这里闭合 setOption
  }; // 👈 这里闭合 renderChart 函数

  // ✅ useEffect 必须在组件作用域内，不能在 renderChart 内
  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  useEffect(() => {
    const resize = () => chartInstance.current?.resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
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
}; // 👈 这里闭合 KLineChart 组件

export default KLineChart; // 👈 最后导出