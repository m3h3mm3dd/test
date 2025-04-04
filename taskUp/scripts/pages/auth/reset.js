/**
 * Password Reset page scripts for TaskUp
 * 
 * Handles email validation and password reset request
 * with smooth Apple-inspired animations
 */

document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const form = document.getElementById('password-reset-form');
    const emailInput = document.getElementById('email');
    const resetButton = document.getElementById('reset-button');
    const emailError = document.getElementById('email-error');
    const successMessage = document.getElementById('success-message');
    
    // Regular expressions for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Whether the email is valid
     */
    const isValidEmail = (email) => {
      return emailRegex.test(email);
    };
    
    /**
     * Validate the form
     * @returns {boolean} Whether the form is valid
     */
    const validateForm = () => {
      // Reset error state
      emailError.style.display = 'none';
      emailInput.classList.remove('error');
      
      // Validate email
      if (!emailInput.value || !isValidEmail(emailInput.value)) {
        emailError.style.display = 'block';
        emailInput.classList.add('error');
        
        // Apply subtle shake animation
        emailInput.classList.add('shake-animation');
        setTimeout(() => {
          emailInput.classList.remove('shake-animation');
        }, 600);
        
        return false;
      }
      
      return true;
    };
    
    /**
     * Simulate sending a reset email
     * In a real app, this would call an API endpoint
     * @param {string} email - User email
     * @returns {Promise} Reset result promise
     */
    const sendResetEmail = (email) => {
      return new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Password reset link sent'
          });
        }, 1500);
      });
    };
    
    /**
     * Show success message with animation
     */
    const showSuccessMessage = () => {
      // Hide the form with a fade out
      form.querySelectorAll('.form-group, .reset-button').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px)';
        element.style.pointerEvents = 'none';
      });
      
      // Show success message with animation
      successMessage.style.display = 'flex';
      successMessage.style.opacity = '0';
      successMessage.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        successMessage.style.opacity = '1';
        successMessage.style.transform = 'translateY(0)';
      }, 300);
      
      // Update button text
      resetButton.textContent = 'Return to Login';
      resetButton.classList.remove('loading');
      resetButton.style.opacity = '1';
      resetButton.style.pointerEvents = 'auto';
      
      // Change button action
      resetButton.removeEventListener('click', handleFormSubmit);
      resetButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'sign-in.html';
      });
    };
    
    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    const handleFormSubmit = async (e) => {
      e.preventDefault();
      
      // Validate the form
      if (!validateForm()) {
        return;
      }
      
      try {
        // Show loading state
        resetButton.textContent = 'Sending...';
        resetButton.classList.add('loading');
        resetButton.disabled = true;
        
        // Send reset email
        const result = await sendResetEmail(emailInput.value);
        
        // Handle success
        if (result.success) {
          showSuccessMessage();
        }
      } catch (error) {
        // Handle error
        resetButton.textContent = 'Send Reset Link';
        resetButton.classList.remove('loading');
        resetButton.disabled = false;
        
        // Show error message
        showErrorMessage(error.message || 'Failed to send reset link. Please try again.');
      }
    };
    
    /**
     * Show error message
     * @param {string} message - Error message
     */
    const showErrorMessage = (message) => {
      // Create or get error element
      let errorElement = document.querySelector('.reset-error');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'reset-error';
        form.insertBefore(errorElement, form.firstChild);
      }
      
      // Set message
      errorElement.textContent = message;
      
      // Apply entry animation
      errorElement.style.maxHeight = '0';
      errorElement.style.opacity = '0';
      errorElement.style.transition = 'max-height 0.3s ease, opacity 0.3s ease, margin 0.3s ease';
      
      // Trigger animation
      setTimeout(() => {
        errorElement.style.maxHeight = '60px';
        errorElement.style.opacity = '1';
        errorElement.style.margin = '0 0 20px';
      }, 10);
    };
    
    /**
     * Setup input event listeners
     */
    const setupInputListeners = () => {
      // Clear error on input
      emailInput.addEventListener('input', () => {
        emailError.style.display = 'none';
        emailInput.classList.remove('error');
        
        // Remove any general error message
        const errorElement = document.querySelector('.reset-error');
        if (errorElement) {
          errorElement.style.maxHeight = '0';
          errorElement.style.opacity = '0';
          errorElement.style.margin = '0';
          
          // Remove after animation completes
          setTimeout(() => {
            errorElement.remove();
          }, 300);
        }
        
        // Update button state
        resetButton.disabled = !emailInput.value;
      });
      
      // Initial button state
      resetButton.disabled = !emailInput.value;
    };
    
    /**
     * Apply entry animations
     */
    const setupAnimations = () => {
      const formElements = [
        document.querySelector('.form-title'),
        document.querySelector('.form-subtitle'),
        document.querySelector('.form-group'),
        resetButton,
        document.querySelector('.back-to-login')
      ];
      
      formElements.forEach((element, index) => {
        if (element) {
          element.style.opacity = '0';
          element.style.transform = 'translateY(15px)';
          element.style.transition = 'opacity 0.4s ease, transform 0.4s var(--ease-spring-1)';
          
          setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
          }, 100 + (index * 100));
        }
      });
      
      // Prepare success message for later animation
      if (successMessage) {
        successMessage.style.display = 'none';
        successMessage.style.transition = 'opacity 0.4s ease, transform 0.4s var(--ease-spring-1)';
      }
    };
    
    /**
     * Initialize the page
     */
    const init = () => {
      // Setup form submission
      form.addEventListener('submit', handleFormSubmit);
      
      setupInputListeners();
      setupAnimations();
      
      // Focus email input after animations
      setTimeout(() => {
        emailInput.focus();
      }, 600);
    };
    
    // Start initialization
    init();
    
    // Add custom styles for animations
    const style = document.createElement('style');
    style.textContent = `
      .reset-error {
        background-color: var(--color-error-surface);
        color: var(--color-error);
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        overflow: hidden;
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
        20%, 40%, 60%, 80% { transform: translateX(4px); }
      }
      
      .shake-animation {
        animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
      }
      
      .loading {
        position: relative;
        color: transparent !important;
        pointer-events: none;
      }
      
      .loading::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        top: 50%;
        left: 50%;
        margin-top: -8px;
        margin-left: -8px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        animation: spin 0.8s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .success-message {
        display: flex;
        align-items: center;
        padding: 16px;
        background-color: var(--color-success-surface);
        border-radius: 8px;
        margin-bottom: 20px;
      }
      
      .success-message svg {
        width: 24px;
        height: 24px;
        color: var(--color-success);
        margin-right: 12px;
        flex-shrink: 0;
      }
      
      .success-message p {
        color: var(--color-success);
        margin: 0;
      }
    `;
    document.head.appendChild(style);
  });