import React, { useState, useCallback, useMemo } from 'react';

const CyberSearch = ({ onSearch, loading, variant = 'default' }) => { 
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  const parsedCodes = useMemo(() => {
    const sanitized = inputValue
      .replace(/[，\n]/g, ' ')
      .split(' ')
      .map((item) => item.trim())
      .filter(Boolean);

    const validCodes = sanitized.filter((item) => /^[0-9]{6}$/.test(item));
    return Array.from(new Set(validCodes)).slice(0, 3);
  }, [inputValue]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);

    const tokens = value
      .replace(/[，\n]/g, ' ')
      .split(' ')
      .map((item) => item.trim())
      .filter(Boolean);

    const isAllValid = tokens.every((item) => item.length === 0 || /^[0-9]{0,6}$/.test(item));
    const completeCodes = tokens.filter((item) => /^[0-9]{6}$/.test(item));

    setIsValid(isAllValid && completeCodes.length > 0 && completeCodes.length <= 3);
  }, []);

  const handleSearch = useCallback(() => {
    if (!parsedCodes.length) return;
    onSearch(parsedCodes);
  }, [onSearch, parsedCodes]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className={`cyber-search-container ${variant === 'compact' ? 'search-compact' : ''}`}>
      {variant !== 'compact' && (
        <div className="search-title">
          <h2>股票代码查询</h2>
          <p>输入6位股票代码，自动获取实时行情</p>
        </div>
      )}
      
      <div className="search-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="例如: 000688 600036 000001"
          className={`cyber-input search-input ${!isValid ? 'invalid' : ''}`}
          disabled={loading}
        />
        
        <button
          onClick={handleSearch}
          disabled={loading || !inputValue.trim() || !isValid}
          className="cyber-button search-button"
        >
          {loading ? '查询中...' : '查询'}
        </button>
      </div>
      
      {variant !== 'compact' && !isValid && inputValue.length > 0 && (
        <div className="error-message">
          请输入 1-3 个 6 位股票代码（空格分隔）
        </div>
      )}
      
      {variant !== 'compact' && parsedCodes.length > 0 && (
        <div className="hint-message">
          已识别 {parsedCodes.length} 只股票代码
        </div>
      )}
    </div>
  );
};

export default CyberSearch;