import React from 'react';
import styles from '../../styles/iosStyles';

/**
 * iOS-style loading spinner component
 * 
 * @param {string} size - Spinner size (xs, sm, md, lg, xl)
 * @param {string} color - Spinner color (primary, success, warning, danger, light, dark)
 * @param {string} label - Optional loading text
 * @param {boolean} centered - Whether to center the spinner in a container
 */
const Spinner = ({
  size = 'md',
  color = 'primary',
  label,
  centered = false,
  className = '',
  ...rest
}) => {
  // Determine spinner size
  const getSizeClass = () => {
    switch (size) {
      case 'xs':
        return 'w-3 h-3';
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      case 'md':
      default:
        return 'w-6 h-6';
    }
  };
  
  // Determine spinner color
  const getColorClass = () => {
    switch (color) {
      case 'success':
        return 'text-green-500 dark:text-green-400';
      case 'warning':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'danger':
        return 'text-red-500 dark:text-red-400';
      case 'light':
        return 'text-white';
      case 'dark':
        return 'text-gray-800 dark:text-gray-300';
      case 'primary':
      default:
        return 'text-blue-500 dark:text-blue-400';
    }
  };
  
  // Determine text size based on spinner size
  const getTextSizeClass = () => {
    switch (size) {
      case 'xs':
      case 'sm':
        return 'text-xs';
      case 'lg':
      case 'xl':
        return 'text-base';
      case 'md':
      default:
        return 'text-sm';
    }
  };
  
  // SVG spinner with iOS-like thin stroke and faster speed
  const spinnerElement = (
    <div className={`inline-flex flex-col items-center ${className}`} {...rest}>
      <svg 
        className={`animate-spin ${getSizeClass()} ${getColorClass()}`}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="2"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      
      {label && (
        <span className={`mt-2 ${getColorClass()} ${getTextSizeClass()} font-medium`}>
          {label}
        </span>
      )}
    </div>
  );
  
  // Return centered spinner if needed
  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        {spinnerElement}
      </div>
    );
  }
  
  // Return spinner directly
  return spinnerElement;
};

export default Spinner;