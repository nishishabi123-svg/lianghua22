# 大盘脉搏API接口文档

## 🎯 功能概述
顶部走马灯组件 `MarketTicker` 已升级为实时数据驱动，展示上证、深证、创业板指及两市成交额的实时数据。

## 📊 API接口规范

### 主接口 - 获取大盘脉搏数据
```
GET /api/market_pulse
```

**响应数据结构:**
```json
{
  "indices": [
    {
      "name": "上证指数",
      "code": "000001", 
      "value": 3245.67,
      "change": 0.82,
      "trend": "up",
      "volume": "1250.6亿",
      "amplitude": "1.2%"
    },
    {
      "name": "深证成指",
      "code": "399001",
      "value": 11234.56, 
      "change": -0.23,
      "trend": "down",
      "volume": "980.3亿",
      "amplitude": "0.8%"
    },
    {
      "name": "创业板指", 
      "code": "399006",
      "value": 2234.78,
      "change": 1.45,
      "trend": "up", 
      "volume": "450.2亿",
      "amplitude": "2.1%"
    }
  ],
  "turnover": "8500.6亿",
  "timestamp": "2024-03-15 14:30:00",
  "market_status": "open"
}
```

### 扩展接口
```
# 获取特定指数详情
GET /api/market/index/{index_code}

# 获取市场热度指标  
GET /api/market/heat

# 获取板块轮动数据
GET /api/market/sector_flow
```

## 🎨 组件实现特性

### 视觉设计升级
- **蓝色渐变背景**: `linear-gradient(90deg, #1e40af, #3b82f6)`
- **高度**: 36px，符合设计规范
- **圆角**: 12px，现代化设计语言
- **白色文字**: 确保在蓝色背景上的可读性

### 数据展示优化
- **轮播机制**: 每4秒自动切换显示不同指数
- **成交额显示**: 固定显示在右侧，用分隔线区分
- **涨跌颜色**: 绿涨红跌，符合A股习惯
- **数据精度**: 指数值保留2位小数，涨跌幅精确到0.01%

### 状态管理完善
- **加载状态**: 显示脉冲动画的加载提示
- **错误处理**: 友好的错误提示和降级方案
- **降级策略**: API失败时使用mock数据保证功能可用
- **定时刷新**: 每30秒自动更新数据

## 🔄 数据流转机制

### 组件生命周期
```
1. 组件挂载 → 调用API获取数据
2. 数据返回 → 更新状态，开始轮播
3. 定时器触发 → 每30秒刷新数据
4. 轮播切换 → 每4秒切换显示指数
5. 组件卸载 → 清理所有定时器
```

### 错误处理策略
```javascript
try {
  // 1. 尝试获取真实数据
  const data = await marketApi.getMarketPulse();
  setMarketData(data);
} catch (error) {
  // 2. API失败时使用mock数据降级
  console.error('大盘数据获取失败:', error);
  setMarketData(mockData);
}
```

## 📱 响应式适配

### 桌面端布局
- 固定高度36px
- 指数信息水平滚动
- 成交额固定显示在右侧

### 移动端适配
- 减小字体大小和间距
- 优化触摸目标尺寸
- 简化显示信息

## ⚡ 性能优化

### 数据缓存策略
- **大盘数据**: 缓存30秒
- **指数详情**: 缓存15秒  
- **热度指标**: 缓存60秒

### 请求优化
- 使用 `useCallback` 避免重复请求
- 组件卸载时自动取消请求
- 防抖处理频繁刷新

## 🎯 业务逻辑

### 轮播显示逻辑
```javascript
const visibleIndices = [
  indices[scrollPosition % 3],    // 当前显示的指数
  indices[(scrollPosition + 1) % 3], // 下一个指数
  indices[(scrollPosition + 2) % 3]  // 下下个指数
];
```

### 涨跌判断规则
- `trend === 'up'`: 绿色显示，正号前缀
- `trend === 'down'`: 红色显示，直接显示负数
- 其他情况: 默认显示

## 🚀 部署配置

### 环境变量
```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:8000

# 生产环境  
VITE_API_BASE_URL=/api
```

### Nginx配置示例
```nginx
location /api/market_pulse {
    proxy_pass http://backend:8000/api/market_pulse;
    proxy_set_header Host $host;
    proxy_cache_use_stale error timeout;
}
```

## 📊 监控指标

### 关键指标
- **API响应时间**: < 200ms
- **数据更新频率**: 30秒
- **轮播切换间隔**: 4秒  
- **错误率**: < 1%

### 性能监控
```javascript
// 添加性能监控标记
const startTime = performance.now();
const data = await marketApi.getMarketPulse();
const duration = performance.now() - startTime;

if (duration > 500) {
  console.warn('Market pulse API slow:', duration + 'ms');
}
```

## ✅ 测试验证

### 功能测试用例
1. **正常数据流**: API返回数据 → 正确显示轮播
2. **错误处理**: API失败 → 显示mock数据
3. **定时刷新**: 30秒后自动更新数据
4. **轮播切换**: 4秒后切换到下一个指数
5. **状态管理**: 加载/错误/正常状态正确切换

### 边界测试
- 网络断开时的降级处理
- 数据格式异常的错误处理  
- 长时间运行的稳定性测试
- 内存泄漏检查

## 🎉 集成完成状态

**大盘走马灯API集成已完成！** ✅
- ✅ 实时数据获取和显示
- ✅ 蓝色渐变背景设计
- ✅ 自动轮播机制
- ✅ 错误处理和降级策略
- ✅ 性能优化和缓存
- ✅ 响应式适配
- ✅ 完整的API文档

现在顶部走马灯显示真实的上证、深证、创业板指数据及两市成交额，支持自动轮播和定时刷新！