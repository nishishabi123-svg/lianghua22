# 个股档案API接口文档

## 🎯 功能概述
右侧动态栏组件 `DynamicSidebar` 提供个股深度档案信息，包含三大核心模块：

### 📊 核心数据源
- **高管动态**: `holder_changes` 数据表
- **新闻情报**: `news_feed` 数据表  
- **分红档案**: `dividends` 数据表
- **公司概况**: `company_info` 数据表

## 🔌 API接口规范

### 主接口 - 统一获取所有档案信息
```
GET /api/stock_info?symbol={股票代码}
```

**响应数据结构:**
```json
{
  "holder_changes": [
    {
      "name": "张三",
      "position": "董事长", 
      "change_type": "increase|decrease",
      "change_amount": "10000股",
      "change_date": "2024-03-15"
    }
  ],
  "news_feed": [
    {
      "title": "公司发布年度业绩报告",
      "summary": "详细新闻摘要...",
      "category": "个股|行业",
      "publish_time": "2024-03-15 14:30",
      "url": "新闻详情链接"
    }
  ],
  "dividends": [
    {
      "dividend_year": "2023",
      "dividend_amount": "2.5元",
      "dividend_type": "现金分红",
      "record_date": "2024-03-20",
      "ex_dividend_date": "2024-03-21"
    }
  ],
  "company_info": {
    "name": "公司全称",
    "business": "主营业务描述",
    "capital": "注册资本"
  }
}
```

### 分接口 - 单独获取各模块数据
```
# 高管变动
GET /api/stock_info/holders?symbol={股票代码}

# 新闻情报  
GET /api/stock_info/news?symbol={股票代码}&limit={数量}

# 分红档案
GET /api/stock_info/dividends?symbol={股票代码}

# 公司概况
GET /api/stock_info/company?symbol={股票代码}
```

## 🎨 前端组件集成

### DynamicSidebar 组件
```jsx
import DynamicSidebar from './components/DynamicSidebar';

// 在诊断页面中使用
<DynamicSidebar 
  stockCode={currentStockCode}
  isVisible={!!currentStockCode}
/>
```

### 组件特性
- **响应式布局**: 320px固定宽度，内部滚动
- **Tab切换**: 高管动态、新闻情报、分红档案
- **数据状态**: Loading、Error、Empty 状态处理
- **视觉设计**: 天蓝SaaS风格，支持暗色模式
- **性能优化**: 仅在可见且有效股票代码时请求数据

## 📊 数据展示规则

### 高管动态显示逻辑
1. **变动类型识别**:
   - `increase` → 绿色涨箭头，增加
   - `decrease` → 红色跌箭头，减少
2. **信息展示**: 姓名、职位、变动数量、变动日期
3. **排序**: 按变动日期倒序排列

### 新闻情报显示逻辑
1. **分类标签**: 个股(蓝色)、行业(绿色)
2. **优先级**: 突发新闻 > 公司公告 > 行业动态
3. **时间格式**: 相对时间(1小时前)或具体时间

### 分红档案显示逻辑
1. **年度展示**: 按分红年度分组
2. **金额标注**: 每10股派送金额
3. **特殊标记**: 特别分红、送股等类型标签

## 🔧 错误处理与边界情况

### API错误处理
- 404: 显示"暂无个股档案数据"
- 500: 显示"个股档案获取失败"
- 网络错误: 显示"网络连接异常"

### 数据为空处理
- 每个Tab都有独立的Empty状态
- 公司概况卡片在无数据时不显示
- 优雅的loading状态过渡

## 🚀 性能优化建议

### 缓存策略
- 个股档案数据缓存30分钟
- 新闻数据缓存15分钟
- 高管变动数据缓存24小时

### 请求优化
- 单个股票统一请求 `/api/stock_info`
- 避免重复请求同一股票数据
- 组件卸载时取消未完成请求

## 📱 移动端适配

### 响应式设计
- 小屏设备: 动态栏移至底部，改为横向滚动
- 触摸优化: Tab点击区域增大
- 信息精简: 简化详细描述，突出关键信息

## 🎯 未来扩展

### 计划功能
- 实时推送重要新闻和高管变动
- 个股对比分析功能
- 自定义关注列表
- 数据导出功能

### 接口扩展
```
# 关注列表管理
POST /api/stock_info/follow
DELETE /api/stock_info/follow/{symbol}

# 数据导出
GET /api/stock_info/export?symbol={code}&format={excel|pdf}
```

## ✅ 集成验证

### 测试用例
1. **正常数据流**: 输入有效股票代码 → 显示完整档案信息
2. **错误处理**: 输入无效代码 → 显示友好错误提示
3. **切换逻辑**: 切换股票 → 动态栏自动刷新数据
4. **性能测试**: 快速切换 → 无重复请求，正确取消

### 调试命令
```bash
# 查看API请求
npm run dev:local

# 模拟数据
curl "http://localhost:8000/api/stock_info?symbol=000001"
```

---

**右侧动态栏组件已完成开发！** 🎯
- 接口标准化完成
- 前端组件集成完成
- 错误处理完善
- 性能优化到位