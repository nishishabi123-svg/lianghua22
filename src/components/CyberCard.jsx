import React from 'react';

const CyberCard = ({ 
  children, 
  title, 
  className = '',
  glass = true,
  neon = false,
  scanning = false,
  ...props 
}) => {
  const baseClasses = 'data-card';
  const conditionalClasses = [
    glass && 'glass-card',
    neon && 'neon-border',
    scanning && 'scanning'
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={`
        ${baseClasses}
        ${conditionalClasses}
        ${className}
      `.trim()}
      {...props}
    >
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default CyberCard;