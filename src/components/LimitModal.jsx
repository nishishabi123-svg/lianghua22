import React from 'react';
import { Modal } from 'antd';

const LimitModal = ({ visible, onClose, userLevel, dailyLimit, usedCount }) => {
  const levelText = {
    guest: '游客',
    normal: '普通会员',
    premium: '付费会员'
  };

  const limitText = {
    guest: '1次',
    normal: '3次',
    premium: '10次'
  };

  return (
    <Modal
      title="分析次数提醒"
      open={visible}
      onCancel={onClose}
      footer={[
        <button key="upgrade" className="cyber-button primary" onClick={onClose}>
          了解会员权益
        </button>,
        <button key="close" className="cyber-button" onClick={onClose}>
          知道了
        </button>
      ]}
      width={400}
      centered
    >
      <div className="limit-modal-content">
        <div className="limit-icon">⚠️</div>
        <h3>今日分析额度已用完</h3>
        <div className="limit-info">
          <p>您当前为<strong>{levelText[userLevel]}</strong></p>
          <p>每日分析上限为<strong>{limitText[userLevel]}</strong></p>
          <p>今日已使用<strong>{usedCount}</strong>次</p>
        </div>
        <div className="limit-suggestions">
          <p>您可以：</p>
          <ul>
            <li>明日再来继续使用免费分析</li>
            <li>升级会员获得更多分析次数</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default LimitModal;