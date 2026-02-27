# API 统一集成说明

## 🎯 目标
统一所有前端API请求到 `/api` 路径，移除硬编码的第三方API地址和密钥，实现后端统一凭证管理。

## ✅ 已完成改动

### 1. 环境配置
- **vite.config.js**: 移除硬编码服务器地址，改用环境变量
- **.env.development**: 开发环境API地址配置
- **.env.production**: 生产环境API地址配置  
- **.env.example**: 环境变量配置示例

### 2. API客户端统一
- **AIDepthAnalysis.jsx**: fetch → api.get()
- **DecisionCard.jsx**: fetch → api.get()
- 统一使用 `import api from '../api'` 

### 3. 安全检查结果
- ✅ 无硬编码API密钥
- ✅ 无直接第三方API调用
- ✅ 统一使用 `/api` 路径
- ✅ 使用axios客户端统一拦截器

## 📋 API调用规范

### 正确的API调用方式
```javascript
import api from '../api';

// GET请求
api.get('/ai_analysis?symbol=000001')

// POST请求
api.post('/user/login', { phone, code })

// PUT请求
api.put('/user/profile', userData)
```

### 环境变量配置
```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:8000

# 生产环境  
VITE_API_BASE_URL=/api
```

## 🔄 代理配置

开发环境请求流程：
```
前端请求 → /api/* → vite代理 → http://localhost:8000/api/*
```

生产环境请求流程：
```
前端请求 → /api/* → nginx/服务器 → 后端API处理
```

## 📦 Package脚本更新

```json
{
  "dev": "vite --host 0.0.0.0 --port 5173",
  "dev:local": "VITE_API_BASE_URL=http://localhost:8000 vite --host 0.0.0.0 --port 5173",
  "build": "vite build", 
  "build:prod": "NODE_ENV=production vite build"
}
```

## 🛡️ 安全保障

1. **前端**: 不存储任何第三方API密钥
2. **后端**: 统一管理所有第三方凭证
3. **传输**: 所有API请求通过统一网关
4. **环境**: 不同环境使用不同配置文件

## 🚀 部署说明

### 开发环境启动
```bash
cd frontend
npm run dev:local
```

### 生产环境构建
```bash
cd frontend
npm run build:prod
```

### 环境变量设置
1. 复制 `.env.example` 为 `.env.local`
2. 根据部署环境修改 `VITE_API_BASE_URL`
3. 确保后端服务在配置地址运行

## 📊 API接口列表

当前已统一接入的API：

| 接口路径 | 用途 | 组件 |
|---------|------|------|
| `/api/ai_analysis` | AI分析决策 | AIDepthAnalysis, DecisionCard |
| `/api/kline` | K线数据 | KLineChart |
| `/api/quote` | 实时行情 | DiagnosisPage |
| `/api/market_pulse` | 大盘走马灯 | MarketTicker |
| `/api/stock_info` | 个股档案 | DynamicSidebar |
| `/api/user/login` | 用户登录 | LoginModal |
| `/api/payment/confirm` | 支付确认 | PaymentModal |

## 🎉 集成完成状态

- ✅ 环境配置统一化
- ✅ API客户端统一化  
- ✅ 安全检查通过
- ✅ 部署脚本更新
- ✅ 文档说明完善

**API统一集成任务已完成！** 🎯