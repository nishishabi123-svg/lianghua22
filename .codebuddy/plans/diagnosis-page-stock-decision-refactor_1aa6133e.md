---
name: diagnosis-page-stock-decision-refactor
overview: 重构 DiagnosisPage 使用 stock_decision 数据结构并接入 KLineChart 10 日数据，同时在 stock.js 添加 stockSchema 说明。
todos:
  - id: add-stock-schema
    content: 在 src/api/stock.js 添加并导出 stockSchema 数据结构描述
    status: completed
  - id: refactor-diagnosis-page
    content: 重构 DiagnosisPage.jsx，拆分逻辑与状态处理，接入 10 日图表数据并补充注释
    status: completed
    dependencies:
      - add-stock-schema
  - id: extend-klinechart-data-mode
    content: 扩展 KLineChart.jsx 支持 data 输入与回退请求，保持样式与交互一致
    status: completed
    dependencies:
      - refactor-diagnosis-page
  - id: consistency-check
    content: 检查传参与渲染一致性，确保加载/错误态与图表展示正确
    status: completed
    dependencies:
      - extend-klinechart-data-mode
---

## User Requirements

- 在现有代码基础上优化诊断页逻辑，保持结构清晰并添加完整中文注释
- 定义并复用股票决策数据结构，用于字段约束与文档说明
- 图表区域展示 10 日 K 线数据，并具备加载与错误态提示

## Product Overview

- 诊断页展示市场状态、股票决策卡片、AI 分析与 10 日 K 线图
- 图表区从决策数据中读取近 10 日收盘价，呈现清晰可读的可视化效果

## Core Features

- 股票决策数据结构统一定义与复用
- 诊断页拆分逻辑、加载/错误态可视化、数据解析清晰
- 10 日 K 线图渲染与兼容回退数据加载

## Tech Stack Selection

- React + Vite（现有项目）
- JavaScript（无 TypeScript）
- Tailwind CSS（现有样式体系）
- ECharts（KLineChart 渲染）
- Ant Design（KLineChart 现有组件）

## Implementation Approach

- 在 `src/api/stock.js` 中补充 `stockSchema`，作为字段结构描述与校验依据，避免字段误用
- `DiagnosisPage.jsx` 使用 `stockSchema` 描述结构，拆分数据解析与渲染逻辑，补充加载与错误态 UI
- `KLineChart.jsx` 增加 `data` 兼容模式：优先使用外部 10 日数据渲染，否则回退到原有拉取逻辑
- 性能考虑：K 线数据解析只在输入变化时计算；避免重复渲染与无效请求

## Implementation Notes (Execution Details)

- `DiagnosisPage.jsx` 中将 `stockData.simple_chart.last_10_days` 预处理为图表数据，避免在渲染中重复计算
- `KLineChart.jsx` 保持原有接口与行为，新增 `data` 不破坏现有调用方
- 错误与加载提示使用现有视觉风格与按钮样式，避免引入新组件

## Architecture Design

- 数据流保持不变：App → DiagnosisPage 传入数据 → 诊断页解析 → 图表渲染
- KLineChart 新增数据注入能力，用于诊断页内的 10 日简版图表

## Directory Structure Summary

本次仅修改既有文件，不新增文件或目录。

```
e:/APK/TXY/lianghua23/lianghua22/
└── src/
    ├── api/
    │   └── stock.js                  # [MODIFY] 增加 stockSchema 数据结构描述与导出，保持现有 API 方法不变
    ├── pages/
    │   └── DiagnosisPage.jsx         # [MODIFY] 拆分逻辑、接入 stockSchema、补充加载/错误态与图表渲染，并添加中文注释
    └── components/
        └── KLineChart.jsx            # [MODIFY] 支持 data 外部输入并兼容 stockCode 拉取模式
```