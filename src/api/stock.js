import api from './index';

// 统一路径规范，确保不重复拼接 /api
export const getDiagnosis = (code) => api.get(`/api/stock_decision?code=${code}`);
export const getKLineData = (symbol) => api.get(`/api/stock_full_report?symbol=${symbol}`);
export const getQuote = getDiagnosis;