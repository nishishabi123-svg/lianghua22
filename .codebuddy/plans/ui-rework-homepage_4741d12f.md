---
name: ui-rework-homepage
overview: 重构首页布局：极简头部、搜索主视觉、市场与K线分屏、AI手风琴分析区，并补充走马灯与样式。
design:
  architecture:
    framework: react
  styleKeywords:
    - 金融终端
    - 深蓝渐变
    - 科技光晕
    - 信息分层
    - 高对比
    - 轻量动效
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 30px
      weight: 600
    subheading:
      size: 18px
      weight: 500
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#1E40AF"
      - "#2563EB"
      - "#38BDF8"
    background:
      - "#0B1D3A"
      - "#F5F7FB"
    text:
      - "#0F172A"
      - "#E2E8F0"
    functional:
      - "#22C55E"
      - "#F97316"
      - "#EF4444"
todos:
  - id: update-header-ticker
    content: 重构 App.jsx 头部布局并更新 MarketTicker 跑马灯逻辑
    status: completed
  - id: add-search-hero
    content: 新增 SearchHero 组件并在 DiagnosisPage 接入搜索与加载状态
    status: completed
    dependencies:
      - update-header-ticker
  - id: rebuild-diagnosis-layout
    content: 重排 DiagnosisPage 分屏图表与热门板块布局并替换 AI 分析入口
    status: completed
    dependencies:
      - add-search-hero
  - id: build-ai-accordion
    content: 实现 AIAccordion 组件与七维度 mock 数据及展开动效
    status: completed
    dependencies:
      - rebuild-diagnosis-layout
  - id: style-and-tailwind
    content: 补充 Tailwind 配置与 App.css/index.css 响应式与视觉样式
    status: completed
    dependencies:
      - build-ai-accordion
---

## User Requirements

- 首页改版为“搜索优先、信息分层、简洁高效”的金融终端布局
- 顶部导航栏极简化：左侧 Logo 与副标题，中部深蓝渐变大盘指数走马灯，右侧固定登录/用户中心并保留数据状态圆点
- Header 下方新增大搜索区，主视觉搜索框与“立即诊断”按钮，带轻科技光晕背景

## Product Overview

- 首页结构重排为：Header → 搜索主视觉 → 市场与图表分屏 → AI 决策分析手风琴

## Core Features

- 搜索主视觉区：大搜索框、提示语、主按钮，位于市场概览上方
- 市场与 K 线分屏：左侧上下排列“分时走势 + 10 日 K 线”，右侧“热门板块”列表（Mock）
- AI 决策分析区：综合结论卡片 + 七大维度手风琴列表 + 展开详情动画

## Tech Stack Selection

- 前端框架：React 18 + Vite
- UI 组件与可视化：现有 antd、echarts-for-react
- 样式：新增 TailwindCSS（满足需求），保留并复用现有 CSS 变量体系与全局样式

## Implementation Approach

- 重构 App.jsx 顶部 Header：左品牌、居中走马灯、右侧用户入口与状态圆点，移除紧凑搜索框与国际联动时间区域
- DiagnosisPage 重新编排为“搜索主视觉 → 市场状态/控制 → 分屏图表与热门板块 → AI 手风琴”
- 市场左侧图表使用 CyberChart 展示分时走势，KLineChart 继续展示 10 日 K 线，垂直堆叠并控制高度
- AI 分析用 AIAccordion 替换 AIDepthAnalysis：顶部综合结论卡 + 七维度折叠条目 + 展开详情
- MarketTicker 改为纯 CSS 跑马灯：数据数组复制滚动，避免定时器渲染抖动

## Implementation Notes (Execution Details)

- SearchHero 复用 CyberSearch 的校验/解析逻辑，保证输入体验一致，并通过 App.jsx 传入 onSearch 与 loading
- 使用 useMemo 缓存热门板块与维度数据，避免每次渲染重建
- 跑马灯采用 CSS keyframes，减少 JS 计时器带来的重绘成本
- Accordion 展开使用 max-height + opacity 过渡，避免内容闪烁
- 保留现有数据流与 Hook（useStockDecision、useStockData），避免影响行情刷新逻辑

## Architecture Design

- 组件层级：App.jsx(Header + Routes) → DiagnosisPage(布局与数据分发) → SearchHero / MarketTicker / CyberChart / KLineChart / AIAccordion
- 数据流：App 负责搜索与行情数据获取 → DiagnosisPage 组合展示 → AIAccordion 以 mock 数据驱动呈现

## Directory Structure Summary

本次改动在现有页面与组件基础上新增主视觉搜索与手风琴分析组件，并重构页面布局与走马灯样式。

```
e:/APK/TXY/lianghua23/lianghua22/
├── src/
│   ├── App.jsx                     # [MODIFY] 头部结构调整，移除紧凑搜索，保留用户入口与状态圆点
│   ├── pages/
│   │   └── DiagnosisPage.jsx        # [MODIFY] 布局重排：SearchHero、图表分屏、热门板块、AIAccordion
│   ├── components/
│   │   ├── MarketTicker.jsx         # [MODIFY] 改为 CSS 跑马灯逻辑与指数列表扩展
│   │   ├── SearchHero.jsx           # [NEW] 大搜索主视觉组件，输入/按钮/提示与光晕背景
│   │   └── AIAccordion.jsx          # [NEW] 综合结论卡 + 七维度手风琴列表与展开详情
│   ├── App.css                      # [MODIFY] Header/搜索区/分屏布局/手风琴基础样式
│   └── index.css                    # [MODIFY] 跑马灯动画与全局样式补充
├── tailwind.config.js               # [NEW] Tailwind 配置（与现有 CSS 变量共存）
└── postcss.config.js                # [NEW] Tailwind 处理配置
```

## Design Style

- 以深蓝渐变与细腻光晕构成金融终端质感，强调搜索主视觉与信息分层
- Header 极简、中心走马灯强调市场脉搏，右侧保留用户入口
- 搜索主视觉大块居中，按钮高对比，整体留白充足
- 图表与热门板块采用分屏栅格，左重右轻，层次清晰
- AI 分析区采用“总-分-细节”结构，手风琴交互强调可读性与可控的信息密度