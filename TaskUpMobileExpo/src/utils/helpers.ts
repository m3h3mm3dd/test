import { format, isValid, parse } from 'date-fns'

/**
 * Format date string from YYYY-MM-DD to more readable format
 */
export const formatDateString = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = parse(dateString, 'yyyy-MM-dd', new Date())
    if (!isValid(date)) return dateString
    
    return format(date, 'MMM d, yyyy')
  } catch (error) {
    return dateString
  }
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Format user's name for display
 */
export const formatName = (firstName: string, lastName: string): string => {
  if (!firstName && !lastName) return ''
  if (!firstName) return lastName
  if (!lastName) return firstName
  
  return `${firstName} ${lastName}`
}

/**
 * Calculate task completion percentage
 */
export const calculateCompletionPercentage = (completed: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  if (!name) return ''
  
  const names = name.split(' ')
  if (names.length === 1) return names[0].charAt(0).toUpperCase()
  
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
}

/**
 * Format time elapsed since date
 */
export const timeAgo = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (!isValid(date)) return ''
    
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return format(date, 'MMM d, yyyy')
  } catch (error) {
    return dateString
  }
}