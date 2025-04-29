/**
 * Utility functions for formatting and transforming data
 */

// Format date string from YYYY-MM-DD to MMM D format
export const formatDateString = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  } catch (error) {
    return dateString
  }
}

// Format date with time
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }
    return date.toLocaleDateString('en-US', options)
  } catch (error) {
    return dateString
  }
}

// Format relative time (e.g., "2 hours ago")
export const timeAgo = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return 'just now'
    }
    
    // Less than an hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    }
    
    // Less than a day
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    }
    
    // Less than a week
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? 'day' : 'days'} ago`
    }
    
    // Format as date for older dates
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  } catch (error) {
    return dateString
  }
}

// Calculate days remaining until due date (negative for overdue)
export const daysUntil = (dateString: string): number => {
  if (!dateString) return 0
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    
    // Reset times to compare dates only
    date.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    
    const diffInMs = date.getTime() - now.getTime()
    return Math.round(diffInMs / (1000 * 60 * 60 * 24))
  } catch (error) {
    return 0
  }
}

// Check if date is in the past
export const isOverdue = (dateString: string): boolean => {
  return daysUntil(dateString) < 0
}

// Calculate completion percentage
export const calculateCompletionPercentage = (completed: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

// Get user initials from name
export const getInitials = (name: string): string => {
  if (!name) return ''
  
  const names = name.split(' ')
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
}

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

// Capitalize first letter of a string
export const capitalize = (text: string): string => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Format full name (first + last)
export const formatName = (firstName: string, lastName: string): string => {
  if (!firstName && !lastName) return ''
  if (!firstName) return lastName
  if (!lastName) return firstName
  
  return `${firstName} ${lastName}`
}

// Convert hex color to rgba
export const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex) return `rgba(0, 0, 0, ${alpha})`
  
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Adjust color brightness
export const adjustColorBrightness = (color: string, percent: number): string => {
  if (!color) return color
  
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  
  const newR = Math.min(255, Math.max(0, R))
  const newG = Math.min(255, Math.max(0, G))
  const newB = Math.min(255, Math.max(0, B))
  
  return '#' + (
    (newR << 16 | newG << 8 | newB)
      .toString(16)
      .padStart(6, '0')
  )
}

// Generate random pastel color
export const generatePastelColor = (): string => {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 70%, 80%)`
}

// Generate color based on string (consistent color for same string)
export const stringToColor = (str: string): string => {
  if (!str) return '#cccccc'
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF
    color += ('00' + value.toString(16)).substr(-2)
  }
  
  return color
}

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format number with commas
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Get file extension from file name
export const getFileExtension = (filename: string): string => {
  if (!filename) return ''
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

// Get days in month
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate()
}

// Get week number
export const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Format currency
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

// Get time from date
export const getTimeFromDate = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    return ''
  }
}

// Get age from birthdate
export const getAge = (birthdate: string): number => {
  if (!birthdate) return 0
  
  try {
    const today = new Date()
    const birthDate = new Date(birthdate)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  } catch (error) {
    return 0
  }
}

// Format phone number
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return ''
  
  // Remove non-digit characters
  const digits = phoneNumber.replace(/\D/g, '')
  
  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  } else if (digits.length === 11) {
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  
  return phoneNumber
}