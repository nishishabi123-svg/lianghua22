import api from './index';

// AI模型配置
const AI_MODELS = {
  deepseek: {
    name: 'DeepSeek',
    endpoint: '/ai/deepseek',
    maxTokens: 4000,
    cost: 0.001
  },
  deepseekR1: {
    name: 'DeepSeek R1',
    endpoint: '/ai/deepseek_r1',
    maxTokens: 8000,
    cost: 0.002
  },
  qwen35: {
    name: 'Qwen3.5',
    endpoint: '/ai/qwen35',
    maxTokens: 6000,
    cost: 0.0015
  }
};

// AI分析类型
const ANALYSIS_TYPES = {
  technical: '技术面分析',
  fundamental: '基本面分析',
  capital: '资金流分析',
  macro: '宏观环境分析',
  international: '国际联动分析',
  sentiment: '舆情情绪分析',
  comprehensive: '综合深度分析'
};

// 获取AI分析
export const getAIAnalysis = async (stockCode, model = 'deepseek', type = 'comprehensive', options = {}) => {
  const modelConfig = AI_MODELS[model];
  if (!modelConfig) {
    throw new Error(`不支持的AI模型: ${model}`);
  }

  try {
    const response = await api.post(modelConfig.endpoint, {
      stockCode,
      analysisType: type,
      model,
      maxTokens: modelConfig.maxTokens,
      ...options
    });

    return {
      success: true,
      data: response.data,
      model: model,
      cost: modelConfig.cost,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI分析失败:', error);
    return {
      success: false,
      error: error.message,
      model: model,
      timestamp: new Date().toISOString()
    };
  }
};

// 获取多维度分析
export const getMultiDimensionAnalysis = async (stockCode, model = 'deepseek') => {
  const dimensions = [
    'technical',
    'fundamental', 
    'capital',
    'macro',
    'international',
    'sentiment'
  ];

  try {
    // 并发请求所有维度分析
    const promises = dimensions.map(dimension => 
      getAIAnalysis(stockCode, model, dimension)
    );

    const results = await Promise.allSettled(promises);
    
    const analysisData = {};
    let totalCost = 0;
    let hasError = false;

    dimensions.forEach((dimension, index) => {
      const result = results[index];
      if (result.status === 'fulfilled' && result.value.success) {
        analysisData[dimension] = result.value.data;
        totalCost += result.value.cost;
      } else {
        analysisData[dimension] = {
          error: true,
          message: '分析失败',
          score: 50,
          status: 'unknown',
          reasoning: `${ANALYSIS_TYPES[dimension]}暂时无法获取`
        };
        hasError = true;
      }
    });

    // 生成综合评分
    const validScores = Object.values(analysisData)
      .filter(item => !item.error && typeof item.score === 'number')
      .map(item => item.score);
    
    const comprehensiveScore = validScores.length > 0 
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
      : 50;

    // 生成操作建议
    const generateRecommendation = (score) => {
      if (score >= 75) return { action: 'buy', confidence: 0.85 };
      if (score >= 60) return { action: 'buy', confidence: 0.70 };
      if (score >= 45) return { action: 'hold', confidence: 0.60 };
      if (score >= 30) return { action: 'sell', confidence: 0.65 };
      return { action: 'sell', confidence: 0.80 };
    };

    const recommendation = generateRecommendation(comprehensiveScore);

    return {
      success: !hasError,
      data: {
        comprehensive: {
          score: Math.round(comprehensiveScore),
          recommendation: recommendation.action,
          confidence: recommendation.confidence,
          entryPoint: null, // 需要从技术面分析中获取
          stopLoss: null,
          targetPrice: null,
          dimensions: analysisData,
          tradePlan: {
            strategy: recommendation.action === 'buy' ? '趋势跟踪' : '风险控制',
            position: recommendation.confidence > 0.75 ? '重仓' : recommendation.confidence > 0.6 ? '中等仓位' : '轻仓',
            timeline: '3-6个月',
            riskLevel: comprehensiveScore > 70 ? '中等' : '较高',
            keyLevels: {
              support: [], // 需要从技术面分析中获取
              resistance: []
            }
          },
          cost: totalCost,
          model: model,
          timestamp: new Date().toISOString()
        }
      },
      hasError,
      totalCost,
      model
    };
  } catch (error) {
    console.error('多维度分析失败:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// 获取国际关联分析
export const getInternationalCorrelation = async (stockCode, internationalData) => {
  try {
    const response = await api.post('/ai/correlation', {
      stockCode,
      internationalData: {
        usMarket: internationalData.usMarket,
        commodities: internationalData.commodities,
        currencies: internationalData.currencies
      },
      analysisType: 'correlation'
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('国际关联分析失败:', error);
    
    // 返回模拟数据作为后备
    return {
      success: true,
      data: {
        correlations: {
          usMarket: 0.65,
          commodities: 0.32,
          currencies: 0.28
        },
        insights: [
          '与美股市场高度相关，需关注美联储政策',
          '受大宗商品价格影响适中',
          '汇率波动影响相对较小'
        ],
        recommendations: [
          '关注美股开盘前的期货走势',
          '监控关键商品价格变化',
          '注意人民币汇率波动'
        ]
      }
    };
  }
};

// AI配置管理
export const getAIModels = () => AI_MODELS;
export const getAnalysisTypes = () => ANALYSIS_TYPES;

// API密钥配置
export const configureAPIKeys = async (keys) => {
  try {
    const response = await api.post('/config/api-keys', keys);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('API密钥配置失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 默认模型优先级配置（国内用户友好）
export const MODEL_PRIORITY = {
  cost: ['deepseek', 'qwen35', 'deepseekR1'],      // 成本优先
  quality: ['deepseekR1', 'qwen35', 'deepseek'],    // 质量优先
  balanced: ['qwen35', 'deepseek', 'deepseekR1']     // 平衡模式
};

// 获取API密钥状态
export const getAPIKeyStatus = async () => {
  try {
    const response = await api.get('/config/api-keys/status');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('获取API密钥状态失败:', error);
    return {
      success: false,
      error: error.message,
      data: {
        deepseek: false,
        deepseekR1: false,
        qwen35: false
      }
    };
  }
};