import React from 'react';
import styles from '../../styles/iosStyles';

/**
 * iOS-style badge component
 * 
 * @param {React.ReactNode} children - Badge content
 * @param {string} variant - Badge variant (default, primary, success, warning, danger)
 * @param {string} size - Badge size (sm, md, lg)
 * @param {boolean} pill - Whether to use pill shape (more rounded)
 * @param {boolean} dot - Whether to show dot only (no content)
 * @param {boolean} glow - Whether to show glow effect
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  pill = false,
  dot = false,
  glow = false,
  className = '',
  ...rest
}) => {
  // Get badge color based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-700 dark:text-blue-300',
          dot: 'bg-blue-500',
          glow: 'shadow-blue-500/50'
        };
      case 'success':
        return {
          background: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-700 dark:text-green-300',
          dot: 'bg-green-500',
          glow: 'shadow-green-500/50'
        };
      case 'warning':
        return {
          background: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-700 dark:text-yellow-300',
          dot: 'bg-yellow-500',
          glow: 'shadow-yellow-500/50'
        };
      case 'danger':
        return {
          background: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-700 dark:text-red-300',
          dot: 'bg-red-500',
          glow: 'shadow-red-500/50'
        };
      case 'default':
      default:
        return {
          background: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-700 dark:text-gray-300',
          dot: 'bg-gray-500',
          glow: 'shadow-gray-500/30'
        };
    }
  };
  
  // Get size classes
  const getSizeClasses = () => {
    if (dot) {
      switch (size) {
        case 'sm':
          return 'w-1.5 h-1.5';
        case 'lg':
          return 'w-3 h-3';
        case 'md':
        default:
          return 'w-2 h-2';
      }
    }
    
    switch (size) {
      case 'sm':
        return 'text-xs px-1.5 py-0.5';
      case 'lg':
        return 'text-base px-3 py-1';
      case 'md':
      default:
        return 'text-xs px-2 py-0.5';
    }
  };
  
  const variantStyles = getVariantStyles();
  
  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-medium
        ${dot ? 'rounded-full' : pill ? 'rounded-full' : 'rounded-md'}
        ${variantStyles.background}
        ${!dot ? variantStyles.text : variantStyles.dot}
        ${getSizeClasses()}
        ${glow ? `shadow-md ${variantStyles.glow}` : ''}
        ${className}
      `}
      {...rest}
    >
      {!dot && children}
    </span>
  );
};

export default Badge;