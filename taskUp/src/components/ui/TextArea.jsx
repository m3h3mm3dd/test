import React, { forwardRef } from 'react';
import styles from '../../styles/iosStyles';

/**
 * iOS-style text area component
 * 
 * @param {string} label - TextArea label
 * @param {string} placeholder - TextArea placeholder
 * @param {boolean} error - Whether the textarea has an error
 * @param {string} errorMessage - Error message to display
 * @param {string} helperText - Helper text to display
 * @param {boolean} disabled - Whether the textarea is disabled
 * @param {number} rows - Number of visible rows
 * @param {number} minRows - Minimum number of rows (for auto-resize)
 * @param {number} maxRows - Maximum number of rows (for auto-resize)
 * @param {boolean} autoResize - Whether to automatically resize based on content
 */
const TextArea = forwardRef(({
  label,
  placeholder,
  error = false,
  errorMessage,
  helperText,
  disabled = false,
  rows = 4,
  className = '',
  ...rest
}, ref) => {
  // Get textarea container styles
  const getContainerStyles = () => {
    let baseStyles = 'relative';
    
    if (disabled) {
      baseStyles += ' opacity-60 cursor-not-allowed';
    }
    
    return baseStyles;
  };
  
  // Get textarea styles
  const getTextAreaStyles = () => {
    let baseStyles = `
      w-full 
      rounded-xl 
      transition-all 
      duration-200 
      outline-none 
      focus:ring-2 
      focus:ring-opacity-50
      dark:bg-gray-800
      dark:text-white
      placeholder-gray-400
      text-base
      py-3 px-4
      resize-none
    `;
    
    if (error) {
      baseStyles += ' border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600';
    } else {
      baseStyles += ' border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600';
    }
    
    baseStyles += ' border';
    
    return baseStyles;
  };
  
  return (
    <div className={`${getContainerStyles()} ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      {/* TextArea */}
      <textarea
        ref={ref}
        className={getTextAreaStyles()}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...rest}
      />
      
      {/* Error message or helper text */}
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
      
      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

export default TextArea;