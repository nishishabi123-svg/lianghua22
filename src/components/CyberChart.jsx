import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import CyberCard from './CyberCard';

const CyberChart = ({ data, title = "分时图", height = 400 }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
      setIsChartReady(true);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!chartInstance.current || !isChartReady || !data) return;

    // 生成模拟分时数据（基于当前股票数据）
    const generateTimeSeriesData = () => {
      const times = [];
      const prices = [];
      const volumes = [];
      
      const basePrice = data.price || 0;
      const now = new Date();
      
      // 生成最近100个时间点的数据
      for (let i = 99; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000); // 每分钟一个数据点
        times.push(time.toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }));
        
        // 模拟价格波动
        const volatility = (Math.random() - 0.5) * basePrice * 0.01;
        const price = basePrice + volatility;
        prices.push(price);
        
        // 模拟成交量
        const volume = Math.random() * 1000 + 100;
        volumes.push(volume);
      }
      
      return { times, prices, volumes };
    };

    const { times, prices, volumes } = generateTimeSeriesData();

    const calcMA = (values, period) => {
      return values.map((_, idx) => {
        if (idx < period) return null;
        const slice = values.slice(idx - period, idx);
        const sum = slice.reduce((acc, val) => acc + val, 0);
        return sum / period;
      });
    };

    const ma5 = calcMA(prices, 5);
    const ma10 = calcMA(prices, 10);
    const supportLevel = Math.min(...prices);
    const resistanceLevel = Math.max(...prices);
    const crossPoints = [];

    for (let i = 1; i < prices.length; i += 1) {
      if (ma5[i - 1] && ma10[i - 1] && ma5[i] && ma10[i]) {
        if (ma5[i - 1] <= ma10[i - 1] && ma5[i] > ma10[i]) {
          crossPoints.push({
            name: '金叉',
            value: prices[i],
            xAxis: times[i],
            yAxis: prices[i],
            itemStyle: { color: '#22c55e' }
          });
        }
        if (ma5[i - 1] >= ma10[i - 1] && ma5[i] < ma10[i]) {
          crossPoints.push({
            name: '死叉',
            value: prices[i],
            xAxis: times[i],
            yAxis: prices[i],
            itemStyle: { color: '#ef4444' }
          });
        }
      }
    }

    const option = {
      backgroundColor: 'transparent',
      title: {
        text: title,
        left: 'center',
        textStyle: {
          color: '#1f2a44',
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: 'rgba(47, 128, 237, 0.2)',
        borderWidth: 1,
        textStyle: {
          color: '#1f2a44'
        }
      },
      grid: [
        {
          left: '10%',
          right: '10%',
          top: '18%',
          height: '58%'
        },
        {
          left: '10%',
          right: '10%',
          top: '80%',
          height: '14%'
        }
      ],
      xAxis: [
        {
          type: 'category',
          data: times,
          gridIndex: 0,
          axisLine: {
            lineStyle: {
              color: 'rgba(47, 128, 237, 0.2)'
            }
          },
          axisLabel: {
            color: 'rgba(91, 107, 140, 0.9)',
            fontSize: 10
          },
          axisTick: {
            lineStyle: {
              color: 'rgba(47, 128, 237, 0.2)'
            }
          }
        },
        {
          type: 'category',
          data: times,
          gridIndex: 1,
          axisLine: {
            lineStyle: {
              color: 'rgba(47, 128, 237, 0.2)'
            }
          },
          axisLabel: {
            color: 'rgba(91, 107, 140, 0.9)',
            fontSize: 10
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          gridIndex: 0,
          scale: true,
          axisLine: {
            lineStyle: {
              color: 'rgba(47, 128, 237, 0.2)'
            }
          },
          axisLabel: {
            color: 'rgba(91, 107, 140, 0.9)',
            formatter: '¥{value}'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(47, 128, 237, 0.08)',
              type: 'dashed'
            }
          }
        },
        {
          type: 'value',
          gridIndex: 1,
          axisLine: {
            lineStyle: {
              color: 'rgba(47, 128, 237, 0.2)'
            }
          },
          axisLabel: {
            color: 'rgba(91, 107, 140, 0.9)',
            formatter: function(value) {
              const num = Number(value) || 0;
              if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'k';
              }
              return num.toFixed(1);
            }
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: '价格',
          type: 'line',
          data: prices,
          smooth: true,
          symbol: 'none',
          lineStyle: {
            color: '#2f80ed',
            width: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(47, 128, 237, 0.25)'
                },
                {
                  offset: 1,
                  color: 'rgba(47, 128, 237, 0.02)'
                }
              ]
            }
          },
          markLine: {
            symbol: 'none',
            label: {
              color: '#5b6b8c',
              fontSize: 10
            },
            lineStyle: {
              color: 'rgba(47, 128, 237, 0.4)',
              type: 'dashed'
            },
            data: [
              { yAxis: supportLevel, name: '支撑位' },
              { yAxis: resistanceLevel, name: '压力位' }
            ]
          },
          markPoint: {
            symbolSize: 28,
            label: {
              color: '#ffffff',
              fontSize: 10
            },
            data: crossPoints
          }
        },
        {
          name: '成交量',
          type: 'bar',
          data: volumes,
          xAxisIndex: 1,
          yAxisIndex: 1,
          itemStyle: {
            color: 'rgba(47, 128, 237, 0.3)',
            borderColor: 'rgba(47, 128, 237, 0.4)',
            borderWidth: 1
          }
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 30,
          end: 100
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          top: '95%',
          start: 30,
          end: 100,
          textStyle: {
            color: 'rgba(91, 107, 140, 0.9)'
          },
          borderColor: 'rgba(47, 128, 237, 0.2)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          handleStyle: {
            color: '#2f80ed'
          },
          dataBackground: {
            areaStyle: {
              color: 'rgba(47, 128, 237, 0.12)'
            },
            lineStyle: {
              color: 'rgba(47, 128, 237, 0.25)'
            }
          }
        }
      ],
      animation: true,
      animationDuration: 600,
      animationEasing: 'cubicOut'
    };

    chartInstance.current.setOption(option, true);

    // 响应式处理
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, title, isChartReady]);

  return (
    <CyberCard title={title} neon>
      <div 
        ref={chartRef} 
        style={{ 
          width: '100%', 
          height: `${height}px`,
          minHeight: '300px'
        }}
      />
      {!data && (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          color: 'rgba(0, 255, 255, 0.5)'
        }}>
          暂无图表数据 - 请先查询股票行情
        </div>
      )}
    </CyberCard>
  );
};

export default CyberChart;