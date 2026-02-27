import api from './index';

/**
 * 个股档案相关API
 * 统一管理高管动态、新闻情报、分红档案等数据获取
 */

export const stockInfoApi = {
  /**
   * 获取个股档案信息
   * @param {string} symbol - 股票代码
   * @returns {Promise} 包含高管动态、新闻情报、分红档案的完整数据
   */
  getStockInfo(symbol) {
    return api.get(`/stock_info?symbol=${symbol}`);
  },

  /**
   * 获取高管变动信息
   * @param {string} symbol - 股票代码
   * @returns {Promise} 高管增减持数据
   */
  getHoldersChanges(symbol) {
    return api.get(`/stock_info/holders?symbol=${symbol}`);
  },

  /**
   * 获取相关新闻情报
   * @param {string} symbol - 股票代码
   * @param {number} limit - 限制数量，默认10条
   * @returns {Promise} 相关新闻列表
   */
  getNewsFeed(symbol, limit = 10) {
    return api.get(`/stock_info/news?symbol=${symbol}&limit=${limit}`);
  },

  /**
   * 获取分红历史记录
   * @param {string} symbol - 股票代码
   * @returns {Promise} 分红送配数据
   */
  getDividends(symbol) {
    return api.get(`/stock_info/dividends?symbol=${symbol}`);
  },

  /**
   * 获取公司基本信息
   * @param {string} symbol - 股票代码
   * @returns {Promise} 公司概况数据
   */
  getCompanyInfo(symbol) {
    return api.get(`/stock_info/company?symbol=${symbol}`);
  }
};

export default stockInfoApi;