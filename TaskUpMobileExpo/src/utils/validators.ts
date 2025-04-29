/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
    if (!email) return false
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  /**
   * Password strength check
   * Returns an object with validation results and strength score (0-4)
   */
  export const checkPasswordStrength = (password: string): {
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
    
    // Consider valid if it has minimum length and at least 3 of the 4 criteria
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
   * Check if a field is empty
   */
  export const isEmptyField = (value: string): boolean => {
    return !value || value.trim() === ''
  }
  
  /**
   * Date validation in YYYY-MM-DD format
   */
  export const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false
    
    // Check format
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(dateString)) return false
    
    // Check actual date validity
    const date = new Date(dateString)
    const timestamp = date.getTime()
    
    if (isNaN(timestamp)) return false
    
    return date.toISOString().slice(0, 10) === dateString
  }
  
  /**
   * Basic URL validation
   */
  export const isValidUrl = (url: string): boolean => {
    if (!url) return false
    
    try {
      new URL(url)
      return true
    } catch (error) {
      return false
    }
  }