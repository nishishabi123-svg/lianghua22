import api from './index';

/**
 * 大盘脉搏相关API
 * 统一管理上证、深证、创业板指等大盘指数数据
 */

export const marketApi = {
  /**
   * 获取大盘脉搏数据(已修复：使用 market_index 接口)
   * @returns {Promise} 包含纳斯达克、A50 等指数数据
   */
  getMarketPulse() {
    return api.get('/market_index');
  },

  /**
   * 获取特定指数详情
   * @param {string} indexCode - 指数代码 (000001/399001/399006)
   * @returns {Promise} 指数详细信息
   */
  getIndexDetail(indexCode) {
    return api.get(`/market/index/${indexCode}`);
  },

  /**
   * 获取市场热度指标
   * @returns {Promise} 包含涨跌家数、成交额等热度数据
   */
  getMarketHeat() {
    return api.get('/market/heat');
  },

  /**
   * 获取板块轮动数据
   * @returns {Promise} 各板块资金流向和涨跌情况
   */
  getSectorFlow() {
    return api.get('/market/sector_flow');
  }
};

export default marketApi;