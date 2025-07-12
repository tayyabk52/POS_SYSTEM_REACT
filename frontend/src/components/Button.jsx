import React from 'react';
import { Button as AntButton, Tooltip } from 'antd';
import { theme } from '../theme';
import PropTypes from 'prop-types';

/**
 * A collection of styled button components for the POS system
 */
export const PrimaryButton = ({ children, icon, size, disabled, onClick, style, tooltip, ...props }) => {
  const button = (
    <AntButton
      type="primary"
      icon={icon}
      size={size}
      disabled={disabled}
      onClick={onClick}
      style={{
        borderRadius: 8,
        fontWeight: 500,
        boxShadow: theme.buttonShadow,
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...style
      }}
      {...props}
    >
      {children}
    </AntButton>
  );

  return tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button;
};

export const SecondaryButton = ({ children, icon, size, disabled, onClick, style, tooltip, ...props }) => {
  const button = (
    <AntButton
      type="default"
      icon={icon}
      size={size}
      disabled={disabled}
      onClick={onClick}
      style={{
        borderRadius: 8,
        fontWeight: 500,
        border: `1px solid ${theme.borderColor}`,
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...style
      }}
      {...props}
    >
      {children}
    </AntButton>
  );

  return tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button;
};

export const DangerButton = ({ children, icon, size, disabled, onClick, style, tooltip, ...props }) => {
  const button = (
    <AntButton
      type="primary"
      danger
      icon={icon}
      size={size}
      disabled={disabled}
      onClick={onClick}
      style={{
        borderRadius: 8,
        fontWeight: 500,
        boxShadow: theme.buttonShadow,
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...style
      }}
      {...props}
    >
      {children}
    </AntButton>
  );

  return tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button;
};

export const IconButton = ({ icon, size, disabled, onClick, shape = "circle", style, tooltip, danger, ariaLabel, ...props }) => {
  const button = (
    <AntButton
      type={danger ? "primary" : "default"}
      danger={danger}
      icon={icon}
      size={size}
      shape={shape}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: danger ? 'none' : `1px solid ${theme.borderColorLight}`,
        boxShadow: 'none',
        transition: 'all 0.2s ease',
        background: danger ? undefined : 'transparent',
        ...style
      }}
      aria-label={ariaLabel || tooltip || 'Action button'}
      {...props}
    />
  );

  return tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button;
};

export const TextButton = ({ children, icon, size, disabled, onClick, style, tooltip, ...props }) => {
  const button = (
    <AntButton
      type="link"
      icon={icon}
      size={size}
      disabled={disabled}
      onClick={onClick}
      style={{
        fontWeight: 500,
        padding: '4px 8px',
        height: 'auto',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        ...style
      }}
      {...props}
    >
      {children}
    </AntButton>
  );

  return tooltip ? <Tooltip title={tooltip}>{button}</Tooltip> : button;
};

// Shared PropTypes for all button components
const commonPropTypes = {
  children: PropTypes.node,
  icon: PropTypes.node,
  size: PropTypes.oneOf(['small', 'middle', 'large']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.object,
  tooltip: PropTypes.string,
};

PrimaryButton.propTypes = commonPropTypes;
SecondaryButton.propTypes = commonPropTypes;
DangerButton.propTypes = commonPropTypes;
TextButton.propTypes = commonPropTypes;

IconButton.propTypes = {
  ...commonPropTypes,
  children: undefined, // Not used in IconButton
  shape: PropTypes.oneOf(['circle', 'round', 'default']),
  danger: PropTypes.bool,
  ariaLabel: PropTypes.string,
};

// Default props
const defaultProps = {
  size: 'middle',
  disabled: false,
};

PrimaryButton.defaultProps = defaultProps;
SecondaryButton.defaultProps = defaultProps;
DangerButton.defaultProps = defaultProps;
IconButton.defaultProps = defaultProps;
TextButton.defaultProps = defaultProps;