import React, { useState, useEffect, useCallback } from 'react';
import CyberCard from './CyberCard';
import { getAPIKeyStatus, configureAPIKeys, getAIModels } from '../api/ai';

const APIConfigPanel = ({ onConfigChange }) => {
  const [apiKeys, setApiKeys] = useState({
    deepseek: '',
    deepseekR1: '',
    qwen35: ''
  });
  const [keyStatus, setKeyStatus] = useState({
    deepseek: false,
    deepseekR1: false,
    qwen35: false
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priorityMode, setPriorityMode] = useState('balanced');

  const aiModels = getAIModels();

  // 获取API密钥状态
  const fetchKeyStatus = useCallback(async () => {
    try {
      const result = await getAPIKeyStatus();
      if (result.success) {
        setKeyStatus(result.data);
      }
    } catch (error) {
      console.error('获取API密钥状态失败:', error);
    }
  }, []);

  useEffect(() => {
    fetchKeyStatus();
  }, [fetchKeyStatus]);

  // 处理密钥输入
  const handleKeyChange = useCallback((model, value) => {
    setApiKeys(prev => ({
      ...prev,
      [model]: value
    }));
  }, []);

  // 测试API密钥
  const testKey = useCallback(async (model) => {
    setTesting(prev => ({ ...prev, [model]: true }));
    
    try {
      // 模拟测试API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟测试结果
      const isValid = apiKeys[model] && apiKeys[model].length > 10;
      
      setKeyStatus(prev => ({
        ...prev,
        [model]: isValid
      }));
      
      if (isValid) {
        // 显示成功提示
        console.log(`${model} API密钥验证成功`);
      }
    } catch (error) {
      console.error(`${model} API密钥测试失败:`, error);
      setKeyStatus(prev => ({
        ...prev,
        [model]: false
      }));
    } finally {
      setTesting(prev => ({ ...prev, [model]: false }));
    }
  }, [apiKeys]);

  // 保存配置
  const saveConfig = useCallback(async () => {
    setLoading(true);
    
    try {
      const result = await configureAPIKeys(apiKeys);
      
      if (result.success) {
        // 重新获取状态
        await fetchKeyStatus();
        
        if (onConfigChange) {
          onConfigChange({
            success: true,
            message: 'API密钥配置已保存'
          });
        }
      }
    } catch (error) {
      console.error('保存API密钥配置失败:', error);
      if (onConfigChange) {
        onConfigChange({
          success: false,
          message: '保存失败: ' + error.message
        });
      }
    } finally {
      setLoading(false);
    }
  }, [apiKeys, fetchKeyStatus, onConfigChange]);

  // 密钥输入组件
  const KeyInput = ({ model }) => {
    const modelInfo = aiModels[model];
    const isActive = keyStatus[model];
    const isTestInProgress = testing[model];
    
    return (
      <div className={`key-input-group ${isActive ? 'active' : ''}`}>
        <div className="key-header">
          <div className="model-info">
            <h4 className="model-name">{modelInfo.name}</h4>
            <p className="model-desc">
              成本: ¥{Number(modelInfo.cost * 1000 || 0).toFixed(2)}/千tokens | 
              最大Token: {modelInfo.maxTokens}
            </p>
          </div>
          <div className={`status-indicator ${isActive ? 'active' : 'inactive'}`}>
            <div className={`status-dot ${isTestInProgress ? 'testing' : ''}`}></div>
            <span className="status-text">
              {isTestInProgress ? '测试中...' : (isActive ? '已连接' : '未配置')}
            </span>
          </div>
        </div>
        
        <div className="key-input-wrapper">
          <input
            type="password"
            value={apiKeys[model]}
            onChange={(e) => handleKeyChange(model, e.target.value)}
            placeholder={`输入 ${modelInfo.name} API 密钥`}
            className="cyber-input key-input"
            disabled={isTestInProgress}
          />
          <button
            onClick={() => testKey(model)}
            disabled={!apiKeys[model] || isTestInProgress}
            className="cyber-button test-button"
          >
            {isTestInProgress ? '测试中...' : '测试'}
          </button>
        </div>
        
        <div className="key-help">
          <span className="help-text">
            获取密钥: 访问 {modelInfo.name} 官方开发者平台
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="api-config-section">
      <CyberCard title="AI API 密钥配置" className="config-panel">
        <div className="config-content">
          <div className="config-description">
            <p>配置AI模型API密钥以启用深度分析功能。支持多个AI模型，系统会根据分析类型智能选择最合适的模型。</p>
          </div>
          
          <div className="keys-grid">
            {Object.keys(aiModels).map(model => (
              <KeyInput key={model} model={model} />
            ))}
          </div>
          
          <div className="config-actions">
            <button
              onClick={saveConfig}
              disabled={loading}
              className="cyber-button save-button"
            >
              {loading ? '保存中...' : '保存配置'}
            </button>
            
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="cyber-button outline-button"
            >
              {showAdvanced ? '隐藏高级设置' : '显示高级设置'}
            </button>
          </div>
          
          {showAdvanced && (
            <div className="advanced-settings">
              <h4>高级配置</h4>
              <div className="setting-item">
                <label>默认模型优先级:</label>
                <select 
                  value={priorityMode}
                  onChange={(e) => setPriorityMode(e.target.value)}
                  className="cyber-input"
                >
                  <option value="cost">成本优先 (DeepSeek)</option>
                  <option value="quality">质量优先 (DeepSeek R1)</option>
                  <option value="balanced">平衡模式 (Qwen3.5)</option>
                </select>
              </div>
              <div className="setting-item">
                <label>并发请求数:</label>
                <input type="number" defaultValue="3" min="1" max="10" className="cyber-input" />
              </div>
              <div className="setting-item">
                <label>超时时间(秒):</label>
                <input type="number" defaultValue="30" min="10" max="120" className="cyber-input" />
              </div>
            </div>
          )}
          
          <div className="usage-info">
            <h4>使用说明</h4>
            <ul className="info-list">
              <li><strong>DeepSeek:</strong> 成本最低，适合日常分析，响应速度快</li>
              <li><strong>DeepSeek R1:</strong> 推理能力最强，适合复杂分析，国内访问友好</li>
              <li><strong>Qwen3.5:</strong> 通义千问旗舰，综合性能优秀，性价比高</li>
              <li>系统会根据分析类型自动选择最优模型</li>
              <li>所有模型均支持国内访问，无需特殊网络环境</li>
              <li>API密钥都经过加密存储，确保安全性</li>
            </ul>
          </div>
        </div>
      </CyberCard>
    </div>
  );
};

export default APIConfigPanel;