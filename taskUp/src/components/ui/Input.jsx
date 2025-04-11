import React, { forwardRef } from 'react';
import styles from '../../styles/iosStyles';

/**
 * iOS-style input component
 * 
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} label - Input label
 * @param {string} placeholder - Input placeholder
 * @param {boolean} error - Whether the input has an error
 * @param {string} errorMessage - Error message to display
 * @param {string} helperText - Helper text to display
 * @param {boolean} disabled - Whether the input is disabled
 * @param {React.ReactNode} leftIcon - Icon to display on the left
 * @param {React.ReactNode} rightIcon - Icon to display on the right
 * @param {function} onLeftIconClick - Function to call when left icon is clicked
 * @param {function} onRightIconClick - Function to call when right icon is clicked
 */
const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  error = false,
  errorMessage,
  helperText,
  disabled = false,
  leftIcon,
  rightIcon,
  onLeftIconClick,
  onRightIconClick,
  className = '',
  ...rest
}, ref) => {
  // Get input container styles
  const getContainerStyles = () => {
    let baseStyles = 'relative';
    
    if (disabled) {
      baseStyles += ' opacity-60 cursor-not-allowed';
    }
    
    return baseStyles;
  };
  
  // Get input styles
  const getInputStyles = () => {
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
    `;
    
    if (error) {
      baseStyles += ' border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600';
    } else {
      baseStyles += ' border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600';
    }
    
    if (leftIcon) {
      baseStyles += ' pl-10';
    } else {
      baseStyles += ' pl-4';
    }
    
    if (rightIcon) {
      baseStyles += ' pr-10';
    } else {
      baseStyles += ' pr-4';
    }
    
    baseStyles += ' py-3 border';
    
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
      
      {/* Input with icons */}
      <div className="relative">
        {leftIcon && (
          <div 
            className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-${onLeftIconClick ? 'auto' : 'none'} text-gray-400`}
            onClick={onLeftIconClick}
          >
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={getInputStyles()}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
        />
        
        {rightIcon && (
          <div 
            className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-${onRightIconClick ? 'auto' : 'none'} text-gray-400`}
            onClick={onRightIconClick}
          >
            {rightIcon}
          </div>
        )}
      </div>
      
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

export default Input;