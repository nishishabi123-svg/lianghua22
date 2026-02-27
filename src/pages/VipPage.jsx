import React from 'react';
import CyberCard from '../components/CyberCard';

const VipPage = () => {
  return (
    <div className="page-container vip-page">
      <section className="page-header">
        <h2>VIP 会员服务</h2>
        <p>解锁精确买卖点位、仓位建议与深度推导内容，让决策更有依据。</p>
      </section>

      <div className="vip-grid">
        <CyberCard title="核心权益">
          <ul className="vip-list">
            <li>专属操盘计划：入场、止损、目标位与建议仓位</li>
            <li>四维度深度推导：技术、基本面、宏观、资金舆情</li>
            <li>多票并行诊断：同时对比 3 只标的</li>
            <li>尾盘突击提示：临近收盘的机会提醒</li>
          </ul>
        </CyberCard>

        <CyberCard title="会员方案">
          <div className="vip-pricing">
            <div className="price">¥199 / 月</div>
            <div className="price-desc">开通后立即生效，可随时续订。</div>
            <button className="cyber-button">立即开通 VIP</button>
          </div>
        </CyberCard>

        <CyberCard title="服务说明">
          <p className="vip-note">
            VIP 服务旨在提供更完整的分析视角与更清晰的操作指引，仍建议结合个人风险偏好进行判断。
          </p>
        </CyberCard>
      </div>
    </div>
  );
};

export default VipPage;
