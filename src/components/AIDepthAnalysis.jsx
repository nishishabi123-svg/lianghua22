import React, { useState, useEffect, useCallback } from 'react';
import CyberCard from './CyberCard';
import api from '../api';

const AIDepthAnalysis = ({ stockCode, isVip }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  const getShortConclusion = useCallback((text) => {
    if (!text) return 'AI 正在决策中...';
    const separators = ['。', '；', ';', '\n'];
    for (const sep of separators) {
      if (text.includes(sep)) {
        return text.split(sep)[0];
      }
    }
    return text.length > 40 ? `${text.slice(0, 40)}...` : text;
  }, []);

  const fetchAnalysis = useCallback(() => {
    if (!stockCode) return;

    setLoading(true);
    setError(null);

    api.get(`/ai_analysis?symbol=${stockCode}`)
      .then((data) => {
        if (data && data.summary) {
          setAnalysisData(data);
        } else {
          setAnalysisData(null);
          setError('AI 数据格式异常');
        }
      })
      .catch((err) => {
        console.error('AI 分析获取失败:', err);
        setError('AI 分析获取失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [stockCode]);

  useEffect(() => {
    if (stockCode) {
      fetchAnalysis();
    }
  }, [stockCode, fetchAnalysis]);

  const toggleExpanded = useCallback((key) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  if (!stockCode) {
    return (
      <CyberCard title="AI 深度分析" className="ai-analysis-section">
        <div className="empty-state-text">请选择股票查看 AI 深度分析</div>
      </CyberCard>
    );
  }

  const dimensions = analysisData?.dimensions || {};
  const dimensionList = [
    { key: 'technical', label: '技术面', content: dimensions.technical },
    { key: 'fundamental', label: '基本面', content: dimensions.fundamental },
    { key: 'macro', label: '宏观/国际联动', content: dimensions.macro },
    { key: 'sentiment', label: '资金/舆情', content: dimensions.sentiment }
  ];

  return (
    <div className="ai-analysis-section">
      <CyberCard title="AI 深度分析">
        <div className="analysis-summary">
          <div className="summary-left">
            <div className="summary-label">综合结论</div>
            <div className="summary-value">{analysisData?.summary || 'AI 正在决策中...'}</div>
          </div>
          <div className="summary-right">
            <div className="summary-label">综合评分</div>
            <div className="summary-score">{analysisData?.score ?? '--'}</div>
          </div>
        </div>

        {error && <div className="analysis-error">{error}</div>}
      </CyberCard>

      <div className="analysis-dimensions">
        {dimensionList.map((item) => {
          const shortText = loading ? 'AI 正在决策中...' : getShortConclusion(item.content);
          const showDetail = isVip && expanded[item.key];
          return (
            <CyberCard key={item.key} className="analysis-dimension">
              <div className="dimension-header">
                <div className="dimension-title">{item.label}</div>
                <button
                  className="cyber-button cyber-button-secondary detail-toggle"
                  onClick={() => toggleExpanded(item.key)}
                  disabled={!isVip || loading}
                >
                  查看详细推导过程
                </button>
              </div>
              <div className="dimension-brief">{shortText}</div>
              {!isVip && (
                <div className="dimension-locked">开通 VIP 解锁详细推导内容</div>
              )}
              {showDetail && (
                <div className="dimension-detail">{item.content || '暂无更多推导内容。'}</div>
              )}
            </CyberCard>
          );
        })}
      </div>
    </div>
  );
};

export default AIDepthAnalysis;
