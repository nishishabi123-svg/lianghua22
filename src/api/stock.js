import api from './index';

// 股票决策数据结构（用于类型校验与文档说明）
export const stockSchema = {
  type: 'object',
  required: true,
  fields: {
    decision: { type: 'string', required: true },
    key_points: {
      type: 'array',
      required: true,
      items: {
        type: 'object',
        required: true,
        fields: {
          title: { type: 'string', required: true },
          content: { type: 'string', required: true }
        }
      }
    },
    market_overview: {
      type: 'object',
      required: true,
      fields: {
        overall_trend: { type: 'string', required: true },
        risk_level: { type: 'string', required: true }
      }
    },
    simple_chart: {
      type: 'object',
      required: true,
      fields: {
        last_10_days: {
          type: 'array',
          required: true,
          items: {
            type: 'object',
            required: true,
            fields: {
              date: { type: 'string', required: true },
              close_price: { type: 'number', required: true }
            }
          }
        }
      }
    }
  }
};

// 简易结构校验工具：按 schema 深度检查数据类型与必填字段
const validateBySchema = (value, schema, path = 'stockData') => {
  const errors = [];

  if (!schema) return errors;

  if (schema.required && (value === null || value === undefined)) {
    errors.push(`${path} 缺少必填字段`);
    return errors;
  }

  if (schema.type === 'object') {
    if (typeof value !== 'object' || Array.isArray(value)) {
      errors.push(`${path} 应为对象`);
      return errors;
    }

    const fields = schema.fields || {};
    Object.keys(fields).forEach((key) => {
      const nextPath = `${path}.${key}`;
      const fieldSchema = fields[key];
      const fieldValue = value?.[key];
      errors.push(...validateBySchema(fieldValue, fieldSchema, nextPath));
    });
  }

  if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push(`${path} 应为数组`);
      return errors;
    }

    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validateBySchema(item, schema.items, `${path}[${index}]`));
      });
    }
  }

  if (schema.type === 'string' && value !== undefined && value !== null) {
    if (typeof value !== 'string') {
      errors.push(`${path} 应为字符串`);
    }
  }

  if (schema.type === 'number' && value !== undefined && value !== null) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      errors.push(`${path} 应为数字`);
    }
  }

  return errors;
};

// 对外的校验方法，返回是否通过与错误列表
export const validateStockData = (data) => {
  const errors = validateBySchema(data, stockSchema);
  return {
    valid: errors.length === 0,
    errors
  };
};


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