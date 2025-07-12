import React from 'react';
import { Input, Select, Space, Button } from 'antd';
import { SearchOutlined, CloseCircleFilled } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { theme } from '../theme';

/**
 * A reusable search bar component that can include additional filters
 */
const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  width = 250,
  allowClear = true,
  size = "middle",
  filters = [],
  onSearch,
  loading = false,
  style,
  ...props
}) => {
  const handleSearch = () => {
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <Space direction="horizontal" size={8} style={{ ...style }}>
      <Input
        prefix={<SearchOutlined style={{ color: theme.textSecondary }} />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        size={size}
        style={{ 
          width,
          borderRadius: theme.borderRadiusSm,
          boxShadow: 'none',
          transition: 'all 0.3s ease'
        }}
        allowClear={{
          clearIcon: <CloseCircleFilled style={{ color: theme.textLight }} />
        }}
        {...props}
      />
      
      {filters.map((filter, index) => (
        <Select
          key={index}
          placeholder={filter.placeholder}
          style={{ width: filter.width || 130, borderRadius: theme.borderRadiusSm }}
          value={filter.value}
          onChange={filter.onChange}
          options={filter.options}
          allowClear={filter.allowClear !== false}
          size={size}
          dropdownRender={filter.dropdownRender}
        />
      ))}
      
      {onSearch && (
        <Button
          icon={<SearchOutlined />}
          onClick={handleSearch}
          loading={loading}
          type="primary"
          size={size}
          style={{ 
            borderRadius: theme.borderRadiusSm,
            boxShadow: 'none' 
          }}
        >
          Search
        </Button>
      )}
    </Space>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  allowClear: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'middle', 'large']),
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      placeholder: PropTypes.string.isRequired,
      value: PropTypes.any,
      onChange: PropTypes.func.isRequired,
      options: PropTypes.array.isRequired,
      width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      allowClear: PropTypes.bool,
      dropdownRender: PropTypes.func
    })
  ),
  onSearch: PropTypes.func,
  loading: PropTypes.bool,
  style: PropTypes.object
};

export default SearchBar;
