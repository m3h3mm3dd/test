import React from 'react';
import styles from '../../styles/iosStyles';

/**
 * iOS-style button component
 * 
 * @param {string} variant - Button style variant (primary, secondary, success, danger, warning)
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} fullWidth - Whether button takes full width of container
 * @param {boolean} rounded - Whether to use more rounded corners
 * @param {React.ReactNode} leftIcon - Icon to display on left side
 * @param {React.ReactNode} rightIcon - Icon to display on right side
 * @param {boolean} isLoading - Whether button is in loading state
 * @param {boolean} disabled - Whether button is disabled
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  rounded = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...rest
}) => {
  // Determine the right styles based on variant
  let variantStyles;
  switch (variant) {
    case 'secondary':
      variantStyles = styles.components.button.secondary;
      break;
    case 'success':
      variantStyles = styles.components.button.success;
      break;
    case 'danger':
      variantStyles = styles.components.button.danger;
      break;
    case 'warning':
      variantStyles = styles.components.button.warning;
      break;
    case 'primary':
    default:
      variantStyles = styles.components.button.primary;
      break;
  }
  
  // Determine size styles
  let sizeStyles;
  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1.5 text-sm';
      break;
    case 'lg':
      sizeStyles = 'px-6 py-3 text-lg';
      break;
    case 'md':
    default:
      sizeStyles = 'px-4 py-2';
      break;
  }
  
  // Generate class names for the button
  const buttonClasses = `
    inline-flex items-center justify-center
    font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
    transition-colors
    ${rounded ? 'rounded-full' : 'rounded-xl'}
    ${sizeStyles}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90 active:bg-opacity-100'}
    ${className}
  `;
  
  // Generate style object based on variant
  const buttonStyle = {
    backgroundColor: variantStyles.bg,
    color: variantStyles.text,
  };
  
  // Manage hover and active states via JavaScript since we're using inline styles
  const handleMouseOver = (e) => {
    if (!disabled && !isLoading) {
      e.currentTarget.style.backgroundColor = variantStyles.hoverBg;
    }
  };
  
  const handleMouseOut = (e) => {
    if (!disabled && !isLoading) {
      e.currentTarget.style.backgroundColor = variantStyles.bg;
    }
  };
  
  const handleMouseDown = (e) => {
    if (!disabled && !isLoading) {
      e.currentTarget.style.backgroundColor = variantStyles.activeBg;
    }
  };
  
  const handleMouseUp = (e) => {
    if (!disabled && !isLoading) {
      e.currentTarget.style.backgroundColor = variantStyles.hoverBg;
    }
  };
  
  return (
    <button
      type={type}
      className={buttonClasses}
      style={buttonStyle}
      disabled={disabled || isLoading}
      onClick={onClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...rest}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;