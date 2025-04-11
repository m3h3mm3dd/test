import React from 'react';
import styles from '../../styles/iosStyles';

/**
 * iOS-style avatar component
 * 
 * @param {string} src - Image source URL
 * @param {string} name - User name (used for fallback initials and alt text)
 * @param {string} size - Avatar size (xs, sm, md, lg, xl)
 * @param {string} status - Online status (online, offline, away, busy)
 * @param {boolean} squared - Whether to use squared corners instead of rounded
 * @param {string} bgColor - Background color (if no image)
 * @param {string} textColor - Text color for initials
 */
const Avatar = ({
  src,
  name,
  size = 'md',
  status,
  squared = false,
  bgColor,
  textColor = 'white',
  className = '',
  ...rest
}) => {
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '';
    
    const nameParts = name.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return '';
    
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Get background color based on name (if not provided)
  const getBackgroundColor = () => {
    if (bgColor) return bgColor;
    
    if (!name) return styles.colors.gray[500];
    
    // Generate a stable color based on the name
    const colorOptions = [
      styles.colors.primary.light,
      styles.colors.red.light,
      styles.colors.green.light,
      styles.colors.purple.light,
      styles.colors.indigo.light,
      styles.colors.teal.light,
      styles.colors.orange.light
    ];
    
    // Simple hash function to get a stable index
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorOptions[hash % colorOptions.length];
  };
  
  // Determine size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-6 h-6 text-xs';
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'lg':
        return 'w-12 h-12 text-lg';
      case 'xl':
        return 'w-16 h-16 text-xl';
      case 'md':
      default:
        return 'w-10 h-10 text-base';
    }
  };
  
  // Get status indicator color
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };
  
  // Get status indicator size
  const getStatusSize = () => {
    switch (size) {
      case 'xs':
        return 'w-1.5 h-1.5';
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-3.5 h-3.5';
      case 'xl':
        return 'w-4 h-4';
      case 'md':
      default:
        return 'w-3 h-3';
    }
  };
  
  // Get status indicator position
  const getStatusPosition = () => {
    switch (size) {
      case 'xs':
        return '-right-0.5 -bottom-0.5';
      case 'sm':
        return '-right-0.5 -bottom-0.5';
      case 'lg':
      case 'xl':
        return '-right-1 -bottom-1';
      case 'md':
      default:
        return '-right-0.5 -bottom-0.5';
    }
  };
  
  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`} {...rest}>
      <div 
        className={`
          ${getSizeClasses()}
          flex items-center justify-center
          ${squared ? 'rounded-xl' : 'rounded-full'}
          overflow-hidden
          ${src ? '' : 'font-medium'}
          transition-shadow duration-200
          shadow-sm hover:shadow-md
        `}
        style={{
          backgroundColor: !src ? getBackgroundColor() : undefined,
          color: textColor,
        }}
      >
        {src ? (
          <img 
            src={src} 
            alt={name || 'Avatar'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback for when image fails to load, initially hidden */}
        <div 
          className={`
            w-full h-full items-center justify-center
            ${src ? 'hidden' : 'flex'}
          `}
        >
          {getInitials(name)}
        </div>
      </div>
      
      {/* Status indicator */}
      {status && (
        <span 
          className={`
            absolute ${getStatusPosition()} 
            ${getStatusSize()} 
            ${getStatusColor()}
            rounded-full 
            border-2 border-white dark:border-gray-800
          `}
        ></span>
      )}
    </div>
  );
};

export default Avatar;