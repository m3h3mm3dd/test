
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
    const defaultOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
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
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
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
    
    return formatDateString(isoString);
  } catch (error) {
    console.error('Error calculating time ago:', error);
    return '';
  }
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format number with comma separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
    .find(item => num >= item.value);
  
  return item
    ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol
    : '0';
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
 * Generate random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID
 */
export const generateId = (length: number = 12): string => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
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
  return Math.round((current / total) * 100);
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} Is empty
 */
export const isEmptyObject = (obj: Record<string, any>): boolean => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Deep clone object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Get contrast color (black or white) based on background
 * @param {string} hexcolor - Hex color code
 * @returns {string} Contrast color
 */
export const getContrastColor = (hexcolor: string): string => {
  if (!hexcolor || typeof hexcolor !== 'string') return '#000000';
  
  // Remove hash if present
  hexcolor = hexcolor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  
  // Calculate contrast
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  
  return yiq >= 128 ? '#000000' : '#FFFFFF';
};

/**
 * Generate random color
 * @returns {string} Random hex color
 */
export const randomColor = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * Format duration in seconds to minutes and seconds
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
  
  // Reset time part for accurate comparison
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  return date < today;
};

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension
 */
export const getFileExtension = (filename: string): string => {
  if (!filename) return '';
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Parse URL parameters
 * @param {string} url - URL with parameters
 * @returns {Record<string, string>} Parameters object
 */
export const parseURLParams = (url: string): Record<string, string> => {
  if (!url || !url.includes('?')) return {};
  
  const params: Record<string, string> = {};
  const queryString = url.split('?')[1];
  
  queryString.split('&').forEach(param => {
    const [key, value] = param.split('=');
    params[key] = decodeURIComponent(value);
  });
  
  return params;
};

/**
 * Get device type based on screen width
 * @param {number} width - Screen width
 * @returns {string} Device type
 */
export const getDeviceType = (width: number): 'mobile' | 'tablet' | 'desktop' => {
  if (width < 576) return 'mobile';
  if (width < 992) return 'tablet';
  return 'desktop';
};

/**
 * Shorten long string from middle
 * @param {string} str - String to shorten
 * @param {number} maxLength - Maximum length
 * @returns {string} Shortened string
 */
export const shortenFromMiddle = (str: string, maxLength: number = 20): string => {
  if (!str || str.length <= maxLength) return str;
  
  const midPoint = Math.floor(str.length / 2);
  const charsToRemove = str.length - maxLength + 3; // +3 for "..."
  const firstHalfEnd = midPoint - Math.floor(charsToRemove / 2);
  const secondHalfStart = midPoint + Math.ceil(charsToRemove / 2);
  
  return str.substring(0, firstHalfEnd) + '...' + str.substring(secondHalfStart);
};

/**
 * Get readable file type from mime type
 * @param {string} mimeType - MIME type
 * @returns {string} Readable file type
 */
export const getFileTypeFromMime = (mimeType: string): string => {
  if (!mimeType) return 'Unknown';
  
  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType.startsWith('video/')) return 'Video';
  if (mimeType.startsWith('audio/')) return 'Audio';
  
  const specificTypes: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.ms-excel': 'Excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
    'application/zip': 'ZIP Archive',
    'application/x-zip-compressed': 'ZIP Archive',
    'text/plain': 'Text',
    'text/html': 'HTML',
    'text/css': 'CSS',
    'text/javascript': 'JavaScript'
  };
  
  return specificTypes[mimeType] || 'Document';
};

/**
 * Create a delay/sleep function
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>} Promise that resolves after specified delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
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
 * Get random item from array
 * @param {Array<T>} array - Source array
 * @returns {T | null} Random item or null if array is empty
 */
export const getRandomItem = <T>(array: T[]): T | null => {
  if (!array || !array.length) return null;
  return array[Math.floor(Math.random() * array.length)];
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
  generateId,
  formatFileSize,
  calculatePercentage,
  isEmptyObject,
  deepClone,
  getContrastColor,
  randomColor,
  formatDuration,
  getDaysLeft,
  isDateInPast,
  getFileExtension,
  parseURLParams,
  getDeviceType,
  shortenFromMiddle,
  getFileTypeFromMime,
  delay,
  groupBy,
  getRandomItem
};