import React from 'react';

const GlobalLoading = ({ text = '加载中...', visible = true }) => {
  if (!visible) return null;

  return (
    <div className="global-loading">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <div className="loading-text">{text}</div>
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoading;