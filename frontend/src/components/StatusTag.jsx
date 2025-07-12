import React from 'react';
import { Tag, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { CheckCircleFilled, CloseCircleFilled, ClockCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';

/**
 * Enhanced status tag component with predefined styles and icons
 */
const StatusTag = ({ 
  status, 
  tooltip, 
  iconOnly = false,
  size = 'default',
  style,
  ...props 
}) => {
  // Define status configurations
  const statusConfigs = {
    active: { color: 'green', icon: <CheckCircleFilled />, text: 'Active' },
    inactive: { color: 'red', icon: <CloseCircleFilled />, text: 'Inactive' },
    pending: { color: 'orange', icon: <ClockCircleFilled />, text: 'Pending' },
    warning: { color: 'gold', icon: <ExclamationCircleFilled />, text: 'Warning' },
    success: { color: 'green', icon: <CheckCircleFilled />, text: 'Success' },
    error: { color: 'red', icon: <CloseCircleFilled />, text: 'Error' },
    processing: { color: 'blue', icon: <ClockCircleFilled />, text: 'Processing' }
  };

  // Get config based on status, allow custom configs for advanced use
  let config;
  if (typeof status === 'string') {
    config = statusConfigs[status.toLowerCase()] || {
      color: 'default',
      text: status,
      icon: null
    };
  } else {
    config = status;
  }

  // Size-specific styling
  const sizeStyles = {
    small: { padding: '0 4px', fontSize: 12 },
    default: { padding: '0 7px', fontSize: 14 },
    large: { padding: '2px 10px', fontSize: 16 }
  };

  const tagElement = (
    <Tag
      color={config.color}
      icon={config.icon}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '10px',
        fontWeight: 500,
        border: 'none',
        ...sizeStyles[size],
        ...style
      }}
      {...props}
    >
      {!iconOnly && config.text}
    </Tag>
  );

  return tooltip ? <Tooltip title={tooltip}>{tagElement}</Tooltip> : tagElement;
};

StatusTag.propTypes = {
  status: PropTypes.oneOfType([
    PropTypes.oneOf(['active', 'inactive', 'pending', 'warning', 'success', 'error', 'processing']),
    PropTypes.shape({
      color: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      icon: PropTypes.node
    })
  ]).isRequired,
  tooltip: PropTypes.string,
  iconOnly: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  style: PropTypes.object
};

export default StatusTag;
