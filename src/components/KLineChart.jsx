import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { Spin } from 'antd';
import api from '../api';

// ✅ 新增：数据标准化函数
const normalizeKlineData = (rawData) => {
  if (!rawData || !Array.isArray(rawData)) return { dates: [], data: [] };
  
  const dates = [];
  const data = [];
  
  rawData.forEach(item => {
    // 确保 item 是数组且至少有 5 个元素
    if (Array.isArray(item) && item.length >= 5) {
      // 后端格式假设: [日期，开盘，收盘，最低，最高] (根据截图数值推断)
      // 如果截图里 1675 是最低，1705 是最高，那顺序就是 [开，收，低，高]
      // 如果截图里 1675 是最高，1705 是最低 (不可能)，那顺序就是 [开，收，高，低]
      
      // 安全起见，我们动态判断高低
      const open = parseFloat(item[1]);
      const close = parseFloat(item[2]);
      const val3 = parseFloat(item[3]);
      const val4 = parseFloat(item[4]);
      
      // 找出真正的最高和最低
      const high = Math.max(val3, val4);
      const low = Math.min(val3, val4);
      
      // 成交量 (如果有第 6 个元素就用，没有就填 0)
      const vol = item.length > 5 ? parseFloat(item[5]) : 0;

      dates.push(String(item[0])); // 日期转字符串
      
      // ECharts 需要: [开盘，收盘，最低，最高，成交量]
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
      
      // 检查是否休市
      if (res.status === 'sleep') {
        setIsMarketClosed(true);
        return;
      }
      
      // ✅ 修改：增加容错，尝试多个字段名
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
    
    chartInstance.current.setOption({
      tooltip: { 
        trigger: 'axis', 
        axisPointer: { type: 'cross' },
        formatter: function (params) {
          // 自定义提示框，显示更友好
          const p = params[0];
          return `日期：${p.name}<br/>开盘：${p.data[0]}<br/>收盘：${p.data[1]}<br/>最低：${p.data[2]}<br/>最高：${p.data[3]}`;
        }
      },
      grid: { left: '10%', right: '5%', bottom: '15%', top: '10%' },
      xAxis: { 
        type: 'category', 
        data: dates, 
        scale: true, 
        boundaryGap: false,
        axisLine: { onZero: false }
      },
      yAxis: { 
        scale: true, 
        splitArea: { show: true },
        position: 'right' // Y 轴放右边，符合国内习惯
      },
      dataZoom: [
        { type: 'inside', start: 50, end: 100 }, 
        { type: 'slider', start: 50, end: 100 }
      ],
      series: [{ 
        type: 'candlestick', 
        data: data, 
        itemStyle: { 
          color: '#ef5350', // 阳线红色
          color0: '#26a69a', // 阴线绿色
          borderColor: '#ef5350',
          borderColor0: '#26a69a'
        }
      }]
    });
  };

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
};

export default KLineChart;