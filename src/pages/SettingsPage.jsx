import React from 'react';
import CyberCard from '../components/CyberCard';

const SettingsPage = () => {
  return (
    <div className="page-container settings-page">
      <section className="page-header">
        <h2>系统设置</h2>
        <p>配置数据刷新策略与 AI 能力参数，保持稳定、可靠的决策输出。</p>
      </section>

      <div className="settings-grid">
        <CyberCard title="个人偏好">
          <div className="settings-item">
            <span>通知设置</span>
            <span className="settings-value">价格提醒与系统通知</span>
          </div>
          <div className="settings-item">
            <span>显示偏好</span>
            <span className="settings-value">主题与界面布局</span>
          </div>
          <div className="settings-item">
            <span>关于牛消息AI</span>
            <span className="settings-value">意见反馈: cuba@88.com</span>
          </div>
        </CyberCard>

        <CyberCard title="使用提示">
          <ul className="settings-list">
            <li>建议在交易时段保持实时刷新。</li>
            <li>深度分析文本将异步加载，请稍候查看。</li>
            <li>所有建议仅供参考，请注意风险控制。</li>
          </ul>
        </CyberCard>
      </div>
    </div>
  );
};

export default SettingsPage;
