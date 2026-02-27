import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', label: '个股诊断' },
  { path: '/strategy', label: '策略选股' },
  { path: '/vip', label: 'VIP 会员' },
  { path: '/settings', label: '系统设置' }
];

const SideNav = () => {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  
  const handleVersionClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      navigate('/admin');
      setClickCount(0);
    }
    
    // 重置点击计数
    setTimeout(() => setClickCount(0), 2000);
  };

  return (
    <aside className="side-nav">
      <div className="side-nav__brand">
        <div className="brand-title">AI 决策终端</div>
        <div className="brand-subtitle">保姆级决策 · 天蓝专业风</div>
      </div>
      <nav className="side-nav__menu">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `side-nav__link ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="side-nav__text">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="side-nav__footer">
        <div className="footer-title">风控提醒</div>
        <div className="footer-text">请结合自身风险承受能力做出交易决策。</div>
        <div 
          className="version-info" 
          onClick={handleVersionClick}
          style={{ 
            marginTop: '8px',
            fontSize: '10px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          版本 v2.0.1
        </div>
      </div>
    </aside>
  );
};

export default SideNav;
