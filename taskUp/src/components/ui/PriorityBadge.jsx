import React from 'react';
import { Flag } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import styles from '../../styles/iosStyles';

/**
 * PriorityBadge component for displaying task priority
 * 
 * @param {string} priority - Priority level ('high', 'medium', 'low')
 * @param {string} size - Badge size (sm, md, lg)
 * @param {boolean} withIcon - Whether to show priority icon
 * @param {boolean} pill - Whether to use more rounded corners
 * @param {boolean} dot - Whether to show colored dot only
 */
const PriorityBadge = ({
  priority,
  size = 'md',
  withIcon = true,
  pill = true,
  dot = false,
  className = '',
  ...rest
}) => {
  const { darkMode } = useTheme();
  
  // Normalize priority string
  const normalizedPriority = priority?.toLowerCase() || 'medium';
  
  // Get priority config
  const getPriorityConfig = () => {
    switch (normalizedPriority) {
      case 'high':
        return {
          bg: darkMode ? styles.priorityStyles.high.darkBg : styles.priorityStyles.high.bg,
          text: darkMode ? styles.priorityStyles.high.darkText : styles.priorityStyles.high.text,
          indicator: styles.priorityStyles.high.indicator,
          label: 'High'
        };
      case 'low':
        return {
          bg: darkMode ? styles.priorityStyles.low.darkBg : styles.priorityStyles.low.bg,
          text: darkMode ? styles.priorityStyles.low.darkText : styles.priorityStyles.low.text,
          indicator: styles.priorityStyles.low.indicator,
          label: 'Low'
        };
      case 'medium':
      default:
        return {
          bg: darkMode ? styles.priorityStyles.medium.darkBg : styles.priorityStyles.medium.bg,
          text: darkMode ? styles.priorityStyles.medium.darkText : styles.priorityStyles.medium.text,
          indicator: styles.priorityStyles.medium.indicator,
          label: 'Medium'
        };
    }
  };
  
  // Get size classes
  const getSizeClasses = () => {
    if (dot) {
      switch (size) {
        case 'sm':
          return 'w-2 h-2';
        case 'lg':
          return 'w-4 h-4';
        case 'md':
        default:
          return 'w-3 h-3';
      }
    }
    
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-sm px-3 py-1.5';
      case 'md':
      default:
        return 'text-xs px-2.5 py-1';
    }
  };
  
  const priorityConfig = getPriorityConfig();
  
  // If only dot is needed
  if (dot) {
    return (
      <span
        className={`inline-block rounded-full ${getSizeClasses()} ${className}`}
        style={{ backgroundColor: priorityConfig.indicator }}
        {...rest}
      ></span>
    );
  }
  
  return (
    <span
      className={`
        inline-flex items-center justify-center font-medium
        ${pill ? 'rounded-full' : 'rounded-md'}
        ${getSizeClasses()}
        ${className}
      `}
      style={{
        backgroundColor: priorityConfig.bg,
        color: priorityConfig.text
      }}
      {...rest}
    >
      {withIcon && (
        <Flag size="1em" className="mr-1" />
      )}
      {priorityConfig.label}
    </span>
  );
};

export default PriorityBadge;