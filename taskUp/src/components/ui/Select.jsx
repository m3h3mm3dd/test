import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from '../../styles/iosStyles';

/**
 * iOS-style select component
 * 
 * @param {Array} options - Array of options with { value, label } format
 * @param {string} label - Select label
 * @param {string} placeholder - Select placeholder
 * @param {any} value - Current selected value
 * @param {function} onChange - Function called when selection changes
 * @param {boolean} error - Whether the select has an error
 * @param {string} errorMessage - Error message to display
 * @param {string} helperText - Helper text to display
 * @param {boolean} disabled - Whether the select is disabled
 * @param {React.ReactNode} leftIcon - Icon to display on the left
 */
const Select = forwardRef(({
  options = [],
  label,
  placeholder = 'Select an option',
  value,
  onChange,
  error = false,
  errorMessage,
  helperText,
  disabled = false,
  leftIcon,
  className = '',
  ...rest
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(() => {
    if (value === undefined) return null;
    return options.find(option => option.value === value) || null;
  });
  
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        selectRef.current && 
        !selectRef.current.contains(e.target) && 
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Update internal state when value changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedOption(options.find(option => option.value === value) || null);
    }
  }, [value, options]);
  
  // Get container styles
  const getContainerStyles = () => {
    let baseStyles = 'relative';
    
    if (disabled) {
      baseStyles += ' opacity-60 cursor-not-allowed';
    }
    
    return baseStyles;
  };
  
  // Get select button styles
  const getSelectStyles = () => {
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
      appearance-none
      text-base
      flex items-center justify-between
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
    
    baseStyles += ' pr-4 py-3 border';
    
    return baseStyles;
  };
  
  // Handle option selection
  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option.value);
    }
  };
  
  // Get display text
  const getDisplayText = () => {
    if (selectedOption) {
      return selectedOption.label;
    }
    return placeholder;
  };
  
  return (
    <div className={`${getContainerStyles()} ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      {/* Select button */}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <button
          ref={selectRef}
          type="button"
          className={getSelectStyles()}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          {...rest}
        >
          <span className={`${!selectedOption ? 'text-gray-400' : ''}`}>
            {getDisplayText()}
          </span>
          
          <ChevronDown 
            className={`ml-2 h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          />
        </button>
        
        {/* Dropdown */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            {options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option.value}
                  className={`
                    px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700
                    ${selectedOption && selectedOption.value === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}
                  `}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No options available</div>
            )}
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

export default Select;