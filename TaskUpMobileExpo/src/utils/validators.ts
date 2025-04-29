/**
 * Email validation function
 * Returns true if the provided email matches the expected format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Password strength validation
 * Returns an object with validation results and strength score
 */
export const validatePassword = (password: string): {
  isValid: boolean
  hasMinLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
  strength: number
} => {
  const minLength = 8
  const hasMinLength = password.length >= minLength
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  
  // Calculate strength (0-4)
  let strength = 0
  if (hasMinLength) strength++
  if (hasUppercase) strength++
  if (hasLowercase) strength++
  if (hasNumber) strength++
  if (hasSpecialChar) strength++
  
  // Consider valid if it has minimum length and at least 3 criteria
  const criteriaCount = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length
  const isValid = hasMinLength && criteriaCount >= 3
  
  return {
    isValid,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    strength
  }
}

/**
 * Date validation in standard formats (YYYY-MM-DD or MM/DD/YYYY)
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false
  
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Validate that the input is a non-empty string
 */
export const isNonEmptyString = (value: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Validate that a string has a minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return typeof value === 'string' && value.length >= minLength
}

/**
 * Validates a form field based on rules
 * Returns empty string if valid, or error message
 */
export const validateField = (
  fieldName: string,
  value: string,
  rules: {
    required?: boolean
    minLength?: number
    maxLength?: number
    email?: boolean
    match?: string
    matchFieldName?: string
  },
  formValues?: Record<string, any>
): string => {
  // Required field validation
  if (rules.required && !isNonEmptyString(value)) {
    return `${fieldName} is required`
  }
  
  // Skip other validations if field is empty and not required
  if (!value && !rules.required) {
    return ''
  }
  
  // Min length validation
  if (rules.minLength && !hasMinLength(value, rules.minLength)) {
    return `${fieldName} must be at least ${rules.minLength} characters`
  }
  
  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    return `${fieldName} cannot exceed ${rules.maxLength} characters`
  }
  
  // Email validation
  if (rules.email && !isValidEmail(value)) {
    return `Please enter a valid email address`
  }
  
  // Match validation (for passwords)
  if (rules.match && value !== rules.match) {
    return `${fieldName} does not match ${rules.matchFieldName || 'confirmation'}`
  }
  
  return ''
}

/**
 * Phone number validation (simple format check)
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false
  
  // Remove non-digit characters for validation
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10
}

/**
 * Username validation (alphanumeric with underscore/dash)
 */
export const isValidUsername = (username: string): boolean => {
  if (!username) return false
  
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  return usernameRegex.test(username)
}

/**
 * URL validation
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return false
  
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}