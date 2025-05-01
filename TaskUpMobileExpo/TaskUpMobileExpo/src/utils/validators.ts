
/**
 * Email validation function
 * Returns true if the provided email matches the expected format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password strength validation
 * Returns an object with validation results and strength score
 */
export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  strength: number;
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const minLength = 8;
  const hasMinLength = password.length >= minLength;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  
  // Calculate strength (0-4)
  let strength = 0;
  if (hasMinLength) strength++;
  if (hasUppercase) strength++;
  if (hasLowercase) strength++;
  if (hasNumber) strength++;
  if (hasSpecialChar) strength++;
  
  // Consider valid if it has minimum length and at least 3 criteria
  const criteriaCount = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;
  const isValid = hasMinLength && criteriaCount >= 3;
  
  return {
    isValid,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    strength
  };
};

/**
 * Date validation in standard formats (YYYY-MM-DD or MM/DD/YYYY)
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validate that the input is a non-empty string
 */
export const isNonEmptyString = (value: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validate that a string has a minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return typeof value === 'string' && value.length >= minLength;
};

/**
 * Field validation rules
 */
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  match?: string;
  matchFieldName?: string;
  pattern?: RegExp;
}

/**
 * Validates a form field based on rules
 * Returns empty string if valid, or error message
 */
export const validateField = (
  fieldName: string,
  value: string,
  rules: ValidationRules,
  formValues?: Record<string, any>
): string => {
  // Required field validation
  if (rules.required && !isNonEmptyString(value)) {
    return `${fieldName} is required`;
  }
  
  // Skip other validations if field is empty and not required
  if (!value && !rules.required) {
    return '';
  }
  
  // Min length validation
  if (rules.minLength && !hasMinLength(value, rules.minLength)) {
    return `${fieldName} must be at least ${rules.minLength} characters`;
  }
  
  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    return `${fieldName} cannot exceed ${rules.maxLength} characters`;
  }
  
  // Email validation
  if (rules.email && !isValidEmail(value)) {
    return `Please enter a valid email address`;
  }
  
  // Match validation (for passwords)
  if (rules.match && value !== rules.match) {
    return `${fieldName} does not match ${rules.matchFieldName || 'confirmation'}`;
  }
  
  // Regex pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    return `Please enter a valid ${fieldName.toLowerCase()}`;
  }
  
  return '';
};

/**
 * Phone number validation (simple format check)
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  
  // Remove non-digit characters for validation
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
};

/**
 * Username validation (alphanumeric with underscore/dash)
 */
export const isValidUsername = (username: string): boolean => {
  if (!username) return false;
  
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * URL validation
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Credit card number validation (basic Luhn algorithm)
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  if (!cardNumber) return false;
  
  // Remove spaces and dashes
  const digits = cardNumber.replace(/[\s-]/g, '');
  
  if (!/^\d+$/.test(digits)) return false;
  if (digits.length < 13 || digits.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  // Loop from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

/**
 * Social security number validation (XXX-XX-XXXX format)
 */
export const isValidSSN = (ssn: string): boolean => {
  if (!ssn) return false;
  
  const ssnRegex = /^(?!000|666|9\d{2})([0-8]\d{2}|7([0-6]\d|7[012]))([-]?)(?!00)\d\d\3(?!0000)\d{4}$/;
  return ssnRegex.test(ssn);
};

/**
 * Zip/Postal code validation (US format)
 */
export const isValidZipCode = (zipCode: string): boolean => {
  if (!zipCode) return false;
  
  const zipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
  return zipRegex.test(zipCode);
};

export default {
  isValidEmail,
  validatePassword,
  isValidDate,
  isNonEmptyString,
  hasMinLength,
  validateField,
  isValidPhone,
  isValidUsername,
  isValidUrl,
  isValidCreditCard,
  isValidSSN,
  isValidZipCode
};