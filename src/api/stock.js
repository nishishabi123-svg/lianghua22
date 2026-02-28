import api from './index';

// 以后全站只靠这两个接口活着：
export const getDiagnosis = (code) => api.get(`/api/stock_decision?code=${code}`);
export const getKLineData = (symbol) => api.get(`/api/stock_full_report?symbol=${symbol}`);