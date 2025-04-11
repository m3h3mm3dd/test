import React from 'react';
import styles from '../../styles/iosStyles';
import { useTheme } from '../../context/ThemeContext';

/**
 * iOS-style card component
 * 
 * @param {string} variant - Card style variant ('standard', 'island')
 * @param {boolean} interactive - Whether card has hover/active states
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 */
const Card = ({
  children,
  variant = 'standard',
  interactive = false,
  className = '',
  onClick,
  ...rest
}) => {
  const { darkMode } = useTheme();
  
  // Get the right style based on variant
  const cardStyle = variant === 'island' 
    ? styles.components.card.island
    : styles.components.card.standard;
  
  // Build card styles
  const getCardBackgroundColor = () => {
    if (variant === 'island') {
      return darkMode ? cardStyle.lightBg : cardStyle.bg;
    } else {
      return darkMode ? cardStyle.darkBg : cardStyle.bg;
    }
  };
  
  const getBorderStyle = () => {
    if (variant === 'island') {
      return cardStyle.border || 'none';
    } else {
      return darkMode ? cardStyle.darkBorder : cardStyle.border;
    }
  };
  
  // CSS classes
  const cardClasses = `
    ${interactive ? 'transition-transform hover:scale-[1.01] active:scale-[0.99]' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;
  
  // Inline styles (for dynamic properties)
  const inlineStyles = {
    backgroundColor: getCardBackgroundColor(),
    backdropFilter: cardStyle.backdropFilter,
    WebkitBackdropFilter: cardStyle.backdropFilter, // For Safari
    boxShadow: cardStyle.shadow,
    borderRadius: cardStyle.borderRadius,
    border: getBorderStyle(),
  };
  
  return (
    <div
      className={cardClasses}
      style={inlineStyles}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};

/**
 * Card.Header component
 */
Card.Header = ({ children, className = '', ...rest }) => {
  return (
    <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${className}`} {...rest}>
      {children}
    </div>
  );
};

/**
 * Card.Body component
 */
Card.Body = ({ children, className = '', ...rest }) => {
  return (
    <div className={`p-4 ${className}`} {...rest}>
      {children}
    </div>
  );
};

/**
 * Card.Footer component
 */
Card.Footer = ({ children, className = '', ...rest }) => {
  return (
    <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Card;