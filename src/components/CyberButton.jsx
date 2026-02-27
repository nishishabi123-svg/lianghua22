import React from 'react';

const CyberButton = ({ 
  children, 
  onClick, 
  loading = false, 
  disabled = false,
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props 
}) => {
  const baseClasses = 'cyber-button';
  const variantClasses = {
    primary: '',
    secondary: 'cyber-button-secondary',
    outline: 'cyber-button-outline'
  };
  
  const sizeClasses = {
    small: 'cyber-button-small',
    medium: '',
    large: 'cyber-button-large'
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant] || ''}
        ${sizeClasses[size] || ''}
        ${loading ? 'loading' : ''}
        ${disabled ? 'disabled' : ''}
        ${className}
      `.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="button-loading">
          <span className="loading-spinner-small"></span>
          {children}
        </span>
      ) : (
        <span className="button-content">{children}</span>
      )}
    </button>
  );
};

export default CyberButton;