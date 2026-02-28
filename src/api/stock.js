import api from './index';

// 核心决策接口
export const getDiagnosis = (code) => api.get(`/api/stock_decision?code=${code}`);

// K线接口
export const getKLineData = (symbol) => api.get(`/api/stock_full_report?symbol=${symbol}`);

// 兼容性导出：如果旧代码调 getQuote，自动转给 getDiagnosis
export const getQuote = getDiagnosis;