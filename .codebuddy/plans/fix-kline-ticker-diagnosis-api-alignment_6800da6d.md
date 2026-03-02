---
name: fix-kline-ticker-diagnosis-api-alignment
overview: 按用户要求修复 KLineChart、MarketTicker、DiagnosisPage 的关键联动与容错逻辑，并核对 API 调用层不再使用多余的 .data 解析。
todos:
  - id: scan-targets
    content: 使用[subagent:code-explorer]复核三处目标文件与调用链
    status: completed
  - id: fix-kline-request
    content: 修改KLineChart请求参数、首行symbol保护与响应日志
    status: completed
    dependencies:
      - scan-targets
  - id: fix-ticker-value
    content: 修正MarketTicker映射与value显示兜底逻辑
    status: completed
    dependencies:
      - scan-targets
  - id: fix-search-flow
    content: 修复DiagnosisPage的GO三步触发顺序与代码同步
    status: completed
    dependencies:
      - scan-targets
  - id: verify-flat-response
    content: 全局校验组件仅使用res扁平读取并回归关键交互
    status: completed
    dependencies:
      - fix-kline-request
      - fix-ticker-value
      - fix-search-flow
---

## User Requirements

- 修复 `KLineChart.jsx` 的请求逻辑：去掉 URL 中的 `&amp;period=${currentPeriod}`，只保留 `symbol` 参数。
- 在 `fetchData` 开头加入强制保护：`if (!symbol) return;`。
- `KLineChart.jsx` 在拿到接口响应后立即打印 `console.log("K线接口返回:", res)`，便于排障。
- 修复 `MarketTicker.jsx` 的跑马灯映射与展示：
- 映射时明确使用 `res.nasdaq.price / res.a50.price / res.shanghai.price` 写入 `value`。
- 展示时改为 `item.value ? Number(item.value).toFixed(2) : '--'`，避免将无值显示为 `0.00`。
- 修复 `DiagnosisPage.jsx` 的 GO 搜索总控流程：点击 GO 时必须执行三步：
1) `setSearchCode(code)`；
2) `fetchAIDiagnosis(code)`；
3) `setCurrentStock` 更新 `code`，确保 `KLineChart` 感知 `symbol` 变化并触发拉取。
- 对齐接口剥壳约定：业务组件全部直接使用 `res.xxx`，禁止 `res.data.xxx` 旧写法。

## Product Overview

- 本次仅修复数据链路与交互触发顺序，不改页面视觉布局与样式。
- 目标是让 K 线、跑马灯、搜索触发三条链路稳定一致，避免“接口有数据但页面不刷新”或“错误默认值展示”的问题。

## Core Features

- K线实时请求链路稳定触发（symbol 变化即刷新）。
- 跑马灯指数值按真实字段映射并安全展示。
- GO 触发行为完整执行并保持状态一致。

## Tech Stack Selection

- 现有项目：React + Vite + Axios + ECharts（保持不变）。
- 延续当前 `src/api/index.js` 拦截器模式（返回 `response.data`），业务层统一按扁平结构读取。

## Implementation Approach

- 采用“最小改动修复”策略：仅调整 3 个目标文件中的请求参数、状态更新顺序和展示表达式。
- 先修触发链路（DiagnosisPage），再修数据源读取（KLine/MarketTicker），最后做全链路回归检查（无 `.data` 残留）。
- 性能影响极小：仅减少无效参数拼接和错误重渲染风险，复杂度维持 O(1)/次请求。

## Implementation Notes

- `KLineChart.jsx`：删除 `period` 请求参数依赖，避免后端不支持导致 500/空数据。
- `DiagnosisPage.jsx`：`handleSearch` 中先更新 `searchCode` 与 `currentStock.code`，再触发诊断，确保子组件收到新 `symbol`。
- `MarketTicker.jsx`：展示层避免把“无值”硬转为 `0.00`，防止误导。
- 保持现有 UI 类名、布局结构不变，严格控制变更范围。

## Architecture Design

- 数据流保持现有单向结构：
- `DiagnosisPage` 负责搜索与股票代码状态；
- `KLineChart` 按 `symbol` 拉取并渲染；
- `MarketTicker` 独立轮询大盘数据并滚动展示。
- 不引入新状态库/新通信层，复用现有 hooks 与 api 实例。

## Directory Structure

## Directory Structure Summary

本次为已有页面逻辑修复，预计仅修改以下文件：

- `e:/APK/TXY/lianghua23/lianghua22/src/components/KLineChart.jsx`  [MODIFY]  
目的：修正请求参数与容错入口。
实现：`if (!symbol) return;`、移除 `period` 查询参数、增加接口返回日志。

- `e:/APK/TXY/lianghua23/lianghua22/src/components/MarketTicker.jsx`  [MODIFY]  
目的：修正跑马灯 value 映射与显示策略。
实现：保持 `value` 取 `price`；渲染改为 `item.value ? Number(item.value).toFixed(2) : '--'`。

- `e:/APK/TXY/lianghua23/lianghua22/src/pages/DiagnosisPage.jsx`  [MODIFY]  
目的：修复 GO 行为顺序与 K 线触发链路。
实现：`handleSearch` 内按“setSearchCode → setCurrentStock(code) → fetchAIDiagnosis”执行，并维持扁平 `res.xxx` 读取。

## Agent Extensions

- **SubAgent: code-explorer**
- Purpose: 二次扫描目标文件与调用点，确认无 `res.data` 旧写法残留、无漏改路径。
- Expected outcome: 输出可执行的精确改动清单与影响面校验结果。