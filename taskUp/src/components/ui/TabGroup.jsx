import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../../styles/iosStyles';
import { useTheme } from '../../context/ThemeContext';

/**
 * iOS-style tab group component
 * 
 * @param {Array} tabs - Array of tab objects with { id, label, icon? } format
 * @param {string} defaultTab - ID of default active tab
 * @param {function} onChange - Function called when tab changes
 * @param {string} variant - Tab style variant ('pill', 'segmented', 'underline')
 */
const TabGroup = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'segmented',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0].id : null));
  const tabRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const { darkMode } = useTheme();
  
  // Update the active indicator position
  const updateIndicator = () => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    
    if (activeIndex >= 0 && tabRefs.current[activeIndex]) {
      const tabElement = tabRefs.current[activeIndex];
      
      if (variant === 'underline') {
        setIndicatorStyle({
          width: `${tabElement.offsetWidth}px`,
          transform: `translateX(${tabElement.offsetLeft}px)`,
          height: '2px',
          bottom: '0',
        });
      } else if (variant === 'segmented' || variant === 'pill') {
        setIndicatorStyle({
          width: `${tabElement.offsetWidth}px`,
          height: `${tabElement.offsetHeight}px`,
          transform: `translateX(${tabElement.offsetLeft}px)`,
        });
      }
    }
  };
  
  // Initialize and update indicator on active tab change
  useEffect(() => {
    updateIndicator();
    onChange && onChange(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  
  // Update indicator on resize
  useEffect(() => {
    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Get container and tab styles based on variant
  const getContainerStyles = () => {
    switch (variant) {
      case 'pill':
        return 'p-1 rounded-full bg-gray-100 dark:bg-gray-800';
      case 'segmented':
        return 'p-1 rounded-xl bg-gray-100 dark:bg-gray-800';
      case 'underline':
      default:
        return 'border-b border-gray-200 dark:border-gray-700';
    }
  };
  
  // Get indicator styles based on variant
  const getIndicatorStyles = () => {
    const baseStyles = {
      position: 'absolute',
      transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1), width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      ...indicatorStyle
    };
    
    switch (variant) {
      case 'pill':
        return {
          ...baseStyles,
          backgroundColor: darkMode ? styles.components.tab.active.darkBg : styles.components.tab.active.bg,
          borderRadius: '9999px',
        };
      case 'segmented':
        return {
          ...baseStyles,
          backgroundColor: darkMode ? styles.components.tab.active.darkBg : styles.components.tab.active.bg,
          borderRadius: '0.75rem',
        };
      case 'underline':
      default:
        return {
          ...baseStyles,
          backgroundColor: darkMode ? styles.components.tab.active.darkBg : styles.components.tab.active.bg,
          borderRadius: '1px',
        };
    }
  };
  
  // Get tab item styles based on variant and active state
  const getTabItemStyles = (isActive) => {
    const baseStyles = 'relative z-10 px-4 py-2 text-sm font-medium transition-colors';
    
    switch (variant) {
      case 'pill':
      case 'segmented':
        return `${baseStyles} ${
          isActive 
            ? 'text-white'
            : 'text-gray-700 dark:text-gray-200'
        }`;
      case 'underline':
      default:
        return `${baseStyles} ${
          isActive 
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`relative flex ${getContainerStyles()}`}>
        {/* Background indicator */}
        {variant !== 'underline' && (
          <motion.div
            className="absolute"
            style={getIndicatorStyles()}
            layout
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          />
        )}
        
        {/* Tabs */}
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => tabRefs.current[index] = el}
            className={`${getTabItemStyles(activeTab === tab.id)}`}
            onClick={() => handleTabChange(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            <div className="flex items-center justify-center space-x-1">
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
        
        {/* Underline indicator */}
        {variant === 'underline' && (
          <motion.div
            className="absolute bg-blue-500"
            style={getIndicatorStyles()}
            layout
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TabGroup;