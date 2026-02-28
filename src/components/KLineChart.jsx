import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { Card, Spin, Select, Button, Tooltip } from 'antd';
import { ReloadOutlined, FullscreenOutlined } from '@ant-design/icons';

const { Option } = Select;

const KLineChart = ({ symbol, title = "历史行情", height = 400 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // 北京后端地址
  const BEIJING_SERVER = "http://82.157.126.222:9000";

  const fetchKlineData = useCallback(async () => {
    // 过滤掉初始空值
    if (!symbol || symbol === '------' || symbol === '待搜索') return;

    setLoading(true);
    setError(null);

    try {
      // 1. 调用你后端的完整报告接口，这个接口里含有 K 线数据
      const response = await fetch(`${BEIJING_SERVER}/api/stock_full_report?symbol=${symbol}`);
      const result = await response.json();

      if (result.status === 'success' && result.data?.kline_data) {
        const rawData = result.data.kline_data; // 这里的格式通常是 [[日期, 开, 高, 低, 收, 量], ...]

        // 2. 转换数据格式给 ECharts
        // 注意：后端返回顺序可能是 [日期, 开, 收, 低, 高] 或其他，需根据 main.py 里的 fetch_history_data 对应
        const categoryData = [];
        const values = [];

        rawData.forEach(item => {
          // 假设后端顺序: 0:日期, 1:开, 2:高, 3:低, 4:收
          categoryData.push(item[0]); 
          values.push([item[1], item[4], item[3], item[2]]); // ECharts 顺序: [开, 收, 低, 高]
        });

        renderChart(categoryData, values);
      } else {
        setError('未能从服务器获取到K线序列');
      }
    } catch (err) {
      console.error('❌ K线拉取失败:', err);
      setError('网络连接失败，请检查后端9000端口');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const renderChart = (categoryData, values) => {
    if (!chartRef.current) return;
    
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        textStyle: { color: '#333' }
      },
      grid: { left: '8%', right: '4%', bottom: '15%', top: '10%' },
      xAxis: {
        type: 'category',
        data: categoryData,
        scale: true,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#ccc' } },
        splitLine: { show: false }
      },
      yAxis: {
        scale: true,
        axisLine: { lineStyle: { color: '#ccc' } },
        splitLine: { lineStyle: { color: '#eee' } }
      },
      dataZoom: [
        { type: 'inside', start: 70, end: 100 },
        { type: 'slider', show: true, top: '90%', start: 70, end: 100 }
      ],
      series: [
        {
          name: '日K',
          type: 'candlestick',
          data: values,
          itemStyle: {
            color: '#ef5350',     // 阳线红色
            color0: '#26a69a',    // 阴线绿色
            borderColor: '#ef5350',
            borderColor0: '#26a69a'
          }
        }
      ]
    };

    chartInstance.current.setOption(option);
  };

  useEffect(() => {
    fetchKlineData();
  }, [fetchKlineData]);

  // 响应式调整
  useEffect(() => {
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full relative">
      <Spin spinning={loading}>
        {error ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
            <p className="mb-4">{error}</p>
            <Button size="small" onClick={fetchKlineData}>重试</Button>
          </div>
        ) : (
          <div ref={chartRef} style={{ width: '100%', height: `${height}px` }} />
        )}
      </Spin>
    </div>
  );
};

export default KLineChart;