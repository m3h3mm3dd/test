import React from 'react';
import { motion } from 'framer-motion';
import styles from '../../styles/iosStyles';

/**
 * Progress bar component with iOS-like appearance
 * 
 * @param {number} value - Current progress value (0-100)
 * @param {number} max - Maximum progress value
 * @param {string} size - Bar thickness (xs, sm, md, lg)
 * @param {string} color - Bar color (primary, success, warning, danger)
 * @param {boolean} showValue - Whether to show progress percentage
 * @param {boolean} animated - Whether to animate progress bar
 * @param {boolean} striped - Whether to use striped pattern
 */
const Progress = ({
  value = 0,
  max = 100,
  size = 'md',
  color = 'primary',
  showValue = false,
  animated = true,
  striped = false,
  className = '',
  ...rest
}) => {
  // Ensure value is within bounds
  const normalizedValue = Math.min(Math.max(0, value), max);
  
  // Calculate percentage
  const percentage = Math.round((normalizedValue / max) * 100);
  
  // Get size classes for the track
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'h-1';
      case 'sm':
        return 'h-2';
      case 'lg':
        return 'h-4';
      case 'md':
      default:
        return 'h-3';
    }
  };
  
  // Get color for the track
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
      case 'primary':
      default:
        return 'bg-blue-500';
    }
  };
  
  // Get stripes if needed
  const getStripeStyle = () => {
    if (!striped) return {};
    
    return {
      backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
      backgroundSize: '1rem 1rem'
    };
  };
  
  // Animation variants
  const progressVariants = {
    initial: { width: '0%' },
    animate: { 
      width: `${percentage}%`,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  };
  
  return (
    <div className={`relative ${className}`} {...rest}>
      {/* Background track */}
      <div 
        className={`w-full ${getSizeClasses()} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={normalizedValue}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {/* Progress bar */}
        <motion.div
          className={`h-full ${getColorClasses()} rounded-full`}
          style={{
            ...getStripeStyle(),
            ...(animated && striped ? { animation: 'progress-bar-stripes 1s linear infinite' } : {})
          }}
          initial={animated ? 'initial' : false}
          animate={animated ? 'animate' : false}
          variants={progressVariants}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      
      {/* Progress value */}
      {showValue && (
        <div className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">
          {percentage}%
        </div>
      )}
      
      {/* Animated stripes - add to CSS */}
      {striped && animated && (
        <style jsx>{`
          @keyframes progress-bar-stripes {
            from { background-position: 1rem 0; }
            to { background-position: 0 0; }
          }
        `}</style>
      )}
    </div>
  );
};

export default Progress;