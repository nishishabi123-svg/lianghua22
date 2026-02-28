---
name: fix-kline-500-and-ticker-height
overview: 修复 K 线 500 错误与走马灯高度显示问题，保持现有 UI 与滚动效果不变。
todos:
  - id: fix-kline-parse
    content: 修复 KLineChart.jsx 数据解析与容错，保持 /api/stock_full_report+symbol
    status: completed
  - id: resolve-ticker-style-conflict
    content: 处理 App.css 与 index.css 的 .market-ticker 冲突，确保高度生效
    status: completed
    dependencies:
      - fix-kline-parse
  - id: verify-no-ui-changes
    content: 核对走马灯外观与页面布局未被改动
    status: completed
    dependencies:
      - resolve-ticker-style-conflict
---

## User Requirements

- 修复 K 线接口 500 错误，保持使用 `/api/stock_full_report` 且参数名为 `symbol`
- 走马灯高度恢复为加高版本，并确保可见，不改变其他 UI

## Product Overview

- 股票诊断页面中的 K 线图数据正常加载
- 顶部大盘走马灯显示为加高版样式

## Core Features

- K 线数据请求稳定、解析正确
- 走马灯高度与字体/间距保持加高配置

## Tech Stack Selection

- 前端：React + Vite
- 样式：Tailwind + 全局 CSS
- 请求：Axios 实例（src/api/index.js）
- 图表：ECharts
- 组件：Ant Design Spin

## Implementation Approach

- 保持 `/api/stock_full_report` 与 `symbol` 参数不变，重点校验响应结构并做容错解析，避免 500 时渲染失败。
- 走马灯高度以 `index.css` 为准，移除或收敛 `App.css` 中的重复样式，避免覆盖。
- 性能与稳定性：K 线解析为 O(n)，避免重复渲染；错误时不阻塞 UI。

## Implementation Notes

- KLineChart：保持现有调用方式，增加对 `res.data` 结构的容错判断与空数据保护。
- MarketTicker：不改接口与逻辑，只修复样式覆盖问题。
- CSS：仅处理 `.market-ticker` 相关冲突，避免影响其他布局。

## Architecture Design

- 维持现有组件结构：MarketTicker / KLineChart / DiagnosisPage 不变，仅修复数据与样式冲突。

## Directory Structure Summary

本次改动仅涉及 K 线数据解析与走马灯样式冲突修复。

project-root/
├── src/
│   ├── components/
│   │   └── KLineChart.jsx  # [MODIFY] 增强 /api/stock_full_report 响应解析与容错处理，避免 500 导致渲染失败
│   └── App.css             # [MODIFY] 移除/收敛 .market-ticker 重复样式，防止覆盖 index.css 高度设置
└── src/
└── index.css            # [MODIFY] 保持走马灯加高样式为最终生效版本