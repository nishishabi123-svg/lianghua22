import React, { useCallback, useMemo, useState } from 'react';

const SearchHero = ({ onSearch, loading }) => {
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

    const isAllValid = tokens.every((item) => item.length === 0 || /^[0-9a-zA-Z\u4e00-\u9fa5]{0,8}$/.test(item));
    const completeCodes = tokens.filter((item) => /^[0-9]{6}$/.test(item));

    setIsValid(isAllValid && completeCodes.length > 0 && completeCodes.length <= 3);
  }, []);

  const handleSearch = useCallback(() => {
    if (!parsedCodes.length) return;
    onSearch?.(parsedCodes);
  }, [onSearch, parsedCodes]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <section className="search-hero">
      <div className="search-hero__glow" />
      <div className="search-hero__content">
        <div className="search-hero__title">
          <span className="search-hero__badge">搜索优先 · 极速决策</span>
          <h2>输入股票代码或名称，立即获取 AI 决策</h2>
          <p>聚焦主线、过滤噪声，以结构化结论辅助交易决策。</p>
        </div>
        <div className="search-hero__form">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="例如：000001 / 贵州茅台 / 600036"
            className={`search-hero__input ${!isValid ? 'is-invalid' : ''}`}
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !inputValue.trim() || !isValid}
            className="search-hero__button"
          >
            {loading ? '诊断中...' : '立即诊断'}
          </button>
        </div>
        {!isValid && inputValue.length > 0 && (
          <div className="search-hero__error">请输入 1-3 个 6 位股票代码（支持空格分隔）</div>
        )}
        {parsedCodes.length > 0 && (
          <div className="search-hero__hint">已识别 {parsedCodes.length} 只股票，点击即可开始诊断。</div>
        )}
      </div>
    </section>
  );
};

export default SearchHero;
