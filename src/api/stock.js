import api from './index';

// 彻底修改这个方法，对接北京服务器 9000 的新接口
export const getStockDecision = (code) => {
  // 注意：后端 main.py 要求参数名为 code
  return api.get(`/api/stock_decision?code=${code}`);
};

// 如果需要完整报告（包含K线）
export const getFullReport = (symbol) => {
  return api.get(`/api/stock_full_report?symbol=${symbol}`);
};

// 保持旧方法名兼容，但内部逻辑要改
export const getQuote = (symbol) => {
  return api.get(`/api/stock_decision?code=${symbol}`);
};