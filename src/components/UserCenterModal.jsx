import React, { useState } from 'react';
import { Modal } from 'antd';

const UserCenterModal = ({ visible, onClose, userInfo }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const levelText = {
    guest: '游客',
    normal: '普通会员',
    premium: '付费会员'
  };

  const levelColor = {
    guest: '#8b8b8b',
    normal: '#2f80ed',
    premium: '#f59e0b'
  };

  return (
    <Modal
      title="个人中心"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
    >
      <div className="user-center-content">
        <div className="user-header">
          <div className="user-avatar">👤</div>
          <div className="user-info">
            <div className="user-name">{userInfo?.name || '未登录'}</div>
            <div 
              className="user-level"
              style={{ color: levelColor[userInfo?.level] || '#8b8b8b' }}
            >
              {levelText[userInfo?.level] || '游客'}
            </div>
          </div>
        </div>

        <div className="user-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            基本信息
          </button>
          <button
            className={`tab-button ${activeTab === 'usage' ? 'active' : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            使用情况
          </button>
          <button
            className={`tab-button ${activeTab === 'upgrade' ? 'active' : ''}`}
            onClick={() => setActiveTab('upgrade')}
          >
            会员升级
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <div className="profile-item">
                <span>手机号:</span>
                <span>{userInfo?.phone || '未绑定'}</span>
              </div>
              <div className="profile-item">
                <span>邮箱:</span>
                <span>{userInfo?.email || '未绑定'}</span>
              </div>
              <div className="profile-item">
                <span>注册时间:</span>
                <span>{userInfo?.registerTime || '未知'}</span>
              </div>
              <div className="profile-item">
                <span>会员到期:</span>
                <span>{userInfo?.expireTime || '永久游客'}</span>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="usage-tab">
              <div className="usage-card">
                <div className="usage-title">今日分析次数</div>
                <div className="usage-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(userInfo?.usedCount || 0) / (userInfo?.dailyLimit || 1) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="progress-text">
                    {userInfo?.usedCount || 0} / {userInfo?.dailyLimit || 1}
                  </div>
                </div>
              </div>
              <div className="usage-stats">
                <div className="stat-item">
                  <span className="stat-label">本月使用:</span>
                  <span className="stat-value">{userInfo?.monthlyUsed || 0}次</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">累计使用:</span>
                  <span className="stat-value">{userInfo?.totalUsed || 0}次</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upgrade' && (
            <div className="upgrade-tab">
              <div className="membership-plans">
                <div className="plan-card">
                  <div className="plan-name">普通会员</div>
                  <div className="plan-price">¥99/月</div>
                  <div className="plan-features">
                    <ul>
                      <li>每日3次AI分析</li>
                      <li>基础股票行情</li>
                      <li>邮件客服支持</li>
                    </ul>
                  </div>
                  <button className="plan-button">立即购买</button>
                </div>
                <div className="plan-card premium">
                  <div className="plan-badge">推荐</div>
                  <div className="plan-name">付费会员</div>
                  <div className="plan-price">¥299/月</div>
                  <div className="plan-features">
                    <ul>
                      <li>每日10次AI分析</li>
                      <li>完整AI诊断结果</li>
                      <li>精确买卖点位</li>
                      <li>7×24小时客服</li>
                    </ul>
                  </div>
                  <button className="plan-button primary">立即购买</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UserCenterModal;