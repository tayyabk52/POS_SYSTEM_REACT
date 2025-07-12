import React from 'react';
import { Card as AntCard, Typography } from 'antd';
import PropTypes from 'prop-types';
import { theme } from '../theme';

const { Title } = Typography;

/**
 * Enhanced Card component with consistent styling for the POS system
 */
const Card = ({ 
  children, 
  title,
  subtitle,
  actions,
  headerStyle,
  noPadding = false,
  bordered = false,
  size = 'default',
  shadow = 'default',
  style,
  ...props 
}) => {
  // Shadow presets
  const shadows = {
    none: 'none',
    light: '0 1px 3px rgba(0,0,0,0.05)',
    default: theme.cardShadow || '0 2px 8px rgba(0,0,0,0.1)',
    medium: '0 4px 12px rgba(0,0,0,0.1)',
    heavy: '0 8px 24px rgba(0,0,0,0.12)'
  };

  // Padding based on size and noPadding flag
  const getPadding = () => {
    if (noPadding) return 0;
    
    switch (size) {
      case 'small': return 12;
      case 'large': return 32;
      default: return 24;
    }
  };

  return (
    <AntCard
      bordered={false} // Use custom border styling instead of Ant Design's default
      style={{ 
        borderRadius: theme.borderRadius, 
        boxShadow: shadows[shadow], 
        background: theme.cardBg,
        border: bordered ? `1px solid ${theme.borderColorLight || '#f0f0f0'}` : 'none',
        ...style 
      }}
      bodyStyle={{ 
        padding: getPadding()
      }}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div 
          style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16, // Consistent spacing below header
            padding: noPadding ? `${getPadding()}px ${getPadding()}px 0` : 0,
            ...headerStyle
          }}
        >
          <div>
            {title && (
              <Title 
                level={4} 
                style={{ 
                  margin: 0, 
                  fontWeight: theme.fontWeightBold,
                  color: theme.text
                }}
              >
                {title}
              </Title>
            )}
            {subtitle && (
              <Typography.Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                {subtitle}
              </Typography.Text>
            )}
          </div>
          
          {actions && (
            <div style={{ display: 'flex', gap: 8 }}>
              {actions}
            </div>
          )}
        </div>
      )}
      
      {children}
    </AntCard>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  headerStyle: PropTypes.object,
  noPadding: PropTypes.bool,
  bordered: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  shadow: PropTypes.oneOf(['none', 'light', 'default', 'medium', 'heavy']),
  style: PropTypes.object
};

export default Card;