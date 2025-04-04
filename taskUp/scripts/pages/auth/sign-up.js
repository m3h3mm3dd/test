/**
 * Sign Up page scripts for TaskUp
 * 
 * Handles form validation, password visibility toggling,
 * and smooth animations for the sign up process
 */

document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const form = document.getElementById('sign-up-form');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const signUpButton = document.getElementById('sign-up-button');
    
    // Error message elements
    const firstNameError = document.getElementById('first-name-error');
    const lastNameError = document.getElementById('last-name-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    
    // Password requirement elements
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqLowercase = document.getElementById('req-lowercase');
    const reqNumber = document.getElementById('req-number');
    
    // Toggle password buttons
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    // Regular expressions for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /[0-9]/;
    
    /**
     * Toggle password visibility
     */
    const setupPasswordToggle = () => {
      togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
          const input = button.parentElement.querySelector('input');
          const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
          input.setAttribute('type', type);
          
          // Toggle icon
          if (type === 'text') {
            button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            `;
          } else {
            button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            `;
          }
        });
      });
    };
    
    /**
     * Check password strength requirements
     */
    const setupPasswordRequirements = () => {
      passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        
        // Length requirement
        if (password.length >= 8) {
          reqLength.classList.add('met');
        } else {
          reqLength.classList.remove('met');
        }
        
        // Uppercase letter requirement
        if (uppercaseRegex.test(password)) {
          reqUppercase.classList.add('met');
        } else {
          reqUppercase.classList.remove('met');
        }
        
        // Lowercase letter requirement
        if (lowercaseRegex.test(password)) {
          reqLowercase.classList.add('met');
        } else {
          reqLowercase.classList.remove('met');
        }
        
        // Number requirement
        if (numberRegex.test(password)) {
          reqNumber.classList.add('met');
        } else {
          reqNumber.classList.remove('met');
        }
        
        // Re-check password match if confirm password has value
        if (confirmPasswordInput.value) {
          checkPasswordMatch();
        }
      });
    };
    
    /**
     * Check if passwords match
     */
    const checkPasswordMatch = () => {
      if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.style.display = 'block';
        confirmPasswordInput.classList.add('error');
        return false;
      } else {
        confirmPasswordError.style.display = 'none';
        confirmPasswordInput.classList.remove('error');
        return true;
      }
    };
    
    /**
     * Setup password confirmation validation
     */
    const setupPasswordConfirmation = () => {
      confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    };
    
    /**
     * Validate individual form fields
     * @returns {boolean} Whether all fields are valid
     */
    const validateForm = () => {
      let isValid = true;
      
      // Validate first name
      if (!firstNameInput.value.trim()) {
        firstNameError.style.display = 'block';
        firstNameInput.classList.add('error');
        isValid = false;
      } else {
        firstNameError.style.display = 'none';
        firstNameInput.classList.remove('error');
      }
      
      // Validate last name
      if (!lastNameInput.value.trim()) {
        lastNameError.style.display = 'block';
        lastNameInput.classList.add('error');
        isValid = false;
      } else {
        lastNameError.style.display = 'none';
        lastNameInput.classList.remove('error');
      }
      
      // Validate email
      if (!emailInput.value || !emailRegex.test(emailInput.value)) {
        emailError.style.display = 'block';
        emailInput.classList.add('error');
        isValid = false;
      } else {
        emailError.style.display = 'none';
        emailInput.classList.remove('error');
      }
      
      // Validate password
      const password = passwordInput.value;
      if (password.length < 8 || 
          !uppercaseRegex.test(password) || 
          !lowercaseRegex.test(password) || 
          !numberRegex.test(password)) {
        passwordError.style.display = 'block';
        passwordInput.classList.add('error');
        isValid = false;
      } else {
        passwordError.style.display = 'none';
        passwordInput.classList.remove('error');
      }
      
      // Validate password match
      if (!checkPasswordMatch()) {
        isValid = false;
      }
      
      return isValid;
    };
    
    /**
     * Check form completeness and update button state
     */
    const updateButtonState = () => {
      const requiredInputs = form.querySelectorAll('input[required]');
      let isComplete = true;
      
      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          isComplete = false;
        }
      });
      
      if (isComplete) {
        signUpButton.removeAttribute('disabled');
      } else {
        signUpButton.setAttribute('disabled', 'disabled');
      }
    };
    
    /**
     * Setup form submission handling
     */
    const setupFormSubmission = () => {
      form.addEventListener('submit', (e) => {
        if (!validateForm()) {
          e.preventDefault();
          
          // Shake the form on error
          form.classList.add('shake');
          setTimeout(() => {
            form.classList.remove('shake');
          }, 500);
          
          // Scroll to first error
          const firstError = form.querySelector('.error');
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
          }
        } else {
          // Show loading state on button
          signUpButton.innerHTML = 'Creating Account...';
          signUpButton.classList.add('loading');
          
          // In a real app, would handle form submission via fetch/ajax here
          // For demo, we'll just simulate a delay
          setTimeout(() => {
            window.location.href = 'otp-verification.html';
          }, 1500);
        }
      });
    };
    
    /**
     * Setup input event listeners
     */
    const setupInputListeners = () => {
      const inputs = form.querySelectorAll('input');
      
      inputs.forEach(input => {
        // Update button state when inputs change
        input.addEventListener('input', updateButtonState);
        
        // Clear error on input
        input.addEventListener('input', () => {
          const errorElement = document.getElementById(`${input.id}-error`);
          if (errorElement) {
            errorElement.style.display = 'none';
          }
          input.classList.remove('error');
        });
      });
    };
    
    /**
     * Apply entry animations
     */
    const setupAnimations = () => {
      const formElements = form.querySelectorAll('input, button, .password-requirements, .separator, .social-sign-up, .sign-in-link');
      
      formElements.forEach((element, index) => {
        // Set initial state
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        element.style.transition = 'opacity 0.3s ease, transform 0.3s var(--ease-spring-1)';
        
        // Animate in with staggered timing
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 100 + (index * 50));
      });
    };
    
    /**
     * Initialize the page
     */
    const init = () => {
      setupPasswordToggle();
      setupPasswordRequirements();
      setupPasswordConfirmation();
      setupFormSubmission();
      setupInputListeners();
      setupAnimations();
      
      // Initial button state check
      updateButtonState();
    };
    
    // Start initialization
    init();
  });