import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import styles from '../../styles/iosStyles';

/**
 * iOS-style toggle switch component
 * 
 * @param {boolean} checked - Whether the toggle is checked
 * @param {function} onChange - Function called when toggle changes
 * @param {string} label - Label text
 * @param {string} size - Toggle size (sm, md, lg)
 * @param {boolean} disabled - Whether the toggle is disabled
 * @param {string} color - Custom active color (overrides default)
 */
const Toggle = ({
  checked = false,
  onChange,
  label,
  size = 'md',
  disabled = false,
  color,
  className = '',
  ...rest
}) => {
  const [isChecked, setIsChecked] = useState(checked);
  const { darkMode } = useTheme();
  
  // Update internal state when prop changes
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);
  
  // Handle toggle change
  const handleToggle = () => {
    if (disabled) return;
    
    const newValue = !isChecked;
    setIsChecked(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
  };
  
  // Get the right dimensions based on size
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return {
          width: '36px',
          height: '20px',
          knobSize: '16px',
          knobOffset: '2px',
          knobOffsetChecked: '18px',
        };
      case 'lg':
        return {
          width: '60px',
          height: '36px',
          knobSize: '32px',
          knobOffset: '2px',
          knobOffsetChecked: '26px',
        };
      case 'md':
      default:
        return {
          width: '48px',
          height: '28px',
          knobSize: '24px',
          knobOffset: '2px',
          knobOffsetChecked: '22px',
        };
    }
  };
  
  const dimensions = getDimensions();
  
  // Get background color based on checked state and theme
  const getBackgroundColor = () => {
    if (disabled) {
      return darkMode ? '#374151' : '#D1D5DB';
    }
    
    if (isChecked) {
      if (color) return color;
      return darkMode 
        ? styles.components.toggle.active.darkBg 
        : styles.components.toggle.active.bg;
    }
    
    return darkMode 
      ? styles.components.toggle.inactive.darkBg 
      : styles.components.toggle.inactive.bg;
  };
  
  // Label position classes
  const getLabelClasses = () => {
    return 'text-sm font-medium text-gray-700 dark:text-gray-300';
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      {label && (
        <label className={`${getLabelClasses()} mr-3`}>
          {label}
        </label>
      )}
      
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          relative inline-flex flex-shrink-0 
          rounded-full 
          transition-colors ease-in-out duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: getBackgroundColor()
        }}
        {...rest}
      >
        <span className="sr-only">Toggle</span>
        
        <motion.span
          className="pointer-events-none inline-block rounded-full bg-white shadow-lg transform ring-0"
          style={{
            width: dimensions.knobSize,
            height: dimensions.knobSize,
          }}
          initial={false}
          animate={{
            x: isChecked ? dimensions.knobOffsetChecked : dimensions.knobOffset,
            y: dimensions.knobOffset,
          }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30 
          }}
        />
      </button>
    </div>
  );
};

export default Toggle;