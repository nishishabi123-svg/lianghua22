import React, { useState } from 'react';
import { Input, AutoComplete, Card, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { searchStocks } from '../api/stock';

const { Search } = Input;

const SearchStock = ({ onStockSelect }) => {
  const [searchValue, setSearchValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value) => {
    if (!value) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const result = await searchStocks(value);
      if (result.success && result.data) {
        const stockOptions = result.data.map(stock => ({
          value: stock.symbol,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{stock.name}</strong>
                <span style={{ marginLeft: 8, color: '#666' }}>{stock.symbol}</span>
              </div>
              <div>
                <Tag color={stock.change >= 0 ? 'green' : 'red'}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </Tag>
              </div>
            </div>
          ),
          stock: stock
        }));
        setOptions(stockOptions);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (value, option) => {
    setSearchValue(value);
    if (onStockSelect && option.stock) {
      onStockSelect(option.stock);
    }
  };

  return (
    <Card title="股票搜索" style={{ marginBottom: 16 }}>
      <AutoComplete
        style={{ width: '100%' }}
        options={options}
        onSelect={onSelect}
        onSearch={handleSearch}
        value={searchValue}
        onChange={setSearchValue}
        notFoundContent={loading ? '搜索中...' : '暂无结果'}
      >
        <Search
          placeholder="输入股票代码或名称搜索"
          enterButton={<SearchOutlined />}
          loading={loading}
          size="large"
        />
      </AutoComplete>
    </Card>
  );
};

export default SearchStock;