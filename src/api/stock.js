import api from './index';

// 获取股票行情 - 直接调用 FastAPI 接口
export const getQuote = (symbol) => {
  return api.get(`/quote?symbol=${symbol}`);
};

// 获取股票基本信息
export const getStockInfo = (symbol) => {
  return api.get(`/stock_info?symbol=${symbol}`);
};

// 获取K线数据
export const getKlineData = (symbol, period = '1d', count = 100) => {
  return api.get('/kline', {
    params: { symbol, period, count }
  });
};

// 获取市场情绪
export const getMarketSentiment = () => {
  return api.get('/sentiment');
};

// 搜索股票
export const searchStocks = (keyword) => {
  return api.get('/search', {
    params: { q: keyword }
  });
};