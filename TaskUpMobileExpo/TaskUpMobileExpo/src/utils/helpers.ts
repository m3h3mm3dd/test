/**
 * Format date string from ISO to readable format
 * @param {string} isoString - ISO date string
 * @param {Intl.DateTimeFormatOptions} options - Format options
 * @returns {string} Formatted date string
 */
export const formatDateString = (
  isoString: string, 
  options: Intl.DateTimeFormatOptions = {}
): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const defaultOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    
    // Check if it's today
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    // Check if it's yesterday
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // For other dates, format with the options
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  } catch (error) {
    console.error('Error formatting date:', error);
    return isoString;
  }
};

/**
 * Format date with time
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (isoString: string): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Check if it's today
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      })}`;
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return isoString;
  }
};

/**
 * Format time from ISO string
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted time
 */
export const formatTime = (isoString: string): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid time';
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string} isoString - ISO date string
 * @returns {string} Relative time
 */
export const timeAgo = (isoString: string): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    const now = new Date();
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 5) {
      return 'just now';
    }
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} ${diffInSeconds === 1 ? 'second' : 'seconds'} ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  } catch (error) {
    console.error('Error calculating time ago:', error);
    return '';
  }
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @param {number} count - Number of initials to return
 * @returns {string} Initials
 */
export const getInitials = (name: string, count: number = 2): string => {
  if (!name) return '';
  
  // Remove extra whitespace and split the name
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 0) return '';
  
  if (parts.length === 1) {
    // For single words, take the first 1-2 characters
    return parts[0].substring(0, Math.min(count, 2)).toUpperCase();
  }
  
  // For multiple words, take the first letter of first and last parts
  if (parts.length >= count) {
    return parts
      .slice(0, count)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }
  
  // If we have fewer parts than requested count
  return parts
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
};

/**
 * Format number with comma separator
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (
  num: number | null | undefined, 
  decimals: number = 0
): string => {
  if (num === null || num === undefined) return '0';
  
  const fixedNum = Number.isInteger(num) && decimals === 0 
    ? num 
    : parseFloat(num.toFixed(decimals));
    
  return fixedNum.toLocaleString('en-US');
};

/**
 * Format number with appropriate suffix (K, M, B)
 * @param {number} num - Number to format
 * @param {number} digits - Decimal places
 * @returns {string} Formatted number with suffix
 */
export const formatCompactNumber = (
  num: number | null | undefined, 
  digits: number = 1
): string => {
  if (num === null || num === undefined) return '0';
  
  const absNum = Math.abs(num);
  
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
    { value: 1e12, symbol: 'T' }
  ];
  
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(item => absNum >= item.value);
  
  const formattedNumber = item
    ? (absNum / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
    : '0';
    
  return num < 0 ? `-${formattedNumber}` : formattedNumber;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} Truncated text
 */
export const truncateText = (
  text: string, 
  length: number = 30, 
  suffix: string = '...'
): string => {
  if (!text) return '';
  if (text.length <= length) return text;
  
  // Find the last space within the length limit
  const lastSpace = text.substring(0, length).lastIndexOf(' ');
  
  // If there's a space in the text, truncate at word boundary
  if (lastSpace > 0) {
    return text.substring(0, lastSpace) + suffix;
  }
  
  // Otherwise truncate at exact length
  return text.substring(0, length) + suffix;
};

/**
 * Capitalize first letter of string
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (string: string): string => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Capitalize first letter of each word
 * @param {string} string - String to transform
 * @returns {string} Transformed string
 */
export const titleCase = (string: string): string => {
  if (!string) return '';
  
  return string
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generate random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID
 */
export const generateId = (length: number = 12): string => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Calculate progress percentage
 * @param {number} current - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export const calculatePercentage = (current: number, total: number): number => {
  if (!total) return 0;
  const percentage = (current / total) * 100;
  return Math.min(Math.max(Math.round(percentage), 0), 100); // Ensure between 0-100
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} Is empty
 */
export const isEmptyObject = (obj: Record<string, any> | null | undefined): boolean => {
  if (!obj) return true;
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Deep clone object
 * @param {T} obj - Object to clone
 * @returns {T} Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error('Deep clone failed:', e);
    // Fallback to a less safe method
    return { ...obj } as T;
  }
};

/**
 * Get contrast color (black or white) based on background
 * @param {string} hexcolor - Hex color code
 * @returns {string} Contrast color
 */
export const getContrastColor = (hexcolor: string): string => {
  if (!hexcolor || typeof hexcolor !== 'string') return '#000000';
  
  // Remove hash if present and handle shorthand hex
  let hex = hexcolor.replace('#', '');
  
  // Convert shorthand hex to full form
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  
  // Calculate luminance using perceptual weights
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Get days left until date
 * @param {string} dateString - Target date
 * @returns {number} Days left
 */
export const getDaysLeft = (dateString: string): number => {
  if (!dateString) return 0;
  
  const targetDate = new Date(dateString);
  const currentDate = new Date();
  
  // Check if the date is valid
  if (isNaN(targetDate.getTime())) {
    return 0;
  }
  
  // Reset time part for accurate day calculation
  targetDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);
  
  // Calculate days difference
  const timeDiff = targetDate.getTime() - currentDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return daysDiff;
};

/**
 * Check if a date is in the past
 * @param {string} dateString - Date to check
 * @returns {boolean} Is in past
 */
export const isDateInPast = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const today = new Date();
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return false;
  }
  
  // Reset time part for accurate comparison
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return date < today;
};

/**
 * Group array of objects by key
 * @param {Array<T>} array - Array to group
 * @param {keyof T} key - Key to group by
 * @returns {Record<string, Array<T>>} Grouped object
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * Delay execution for specified time
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>} Promise that resolves after the delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export default {
  formatDateString,
  formatDateTime,
  formatTime,
  timeAgo,
  getInitials,
  formatNumber,
  formatCompactNumber,
  truncateText,
  capitalize,
  titleCase,
  generateId,
  formatFileSize,
  calculatePercentage,
  isEmptyObject,
  deepClone,
  getContrastColor,
  getDaysLeft,
  isDateInPast,
  groupBy,
  delay
};