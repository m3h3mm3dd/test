/**
 * Sign In page scripts for TaskUp
 * 
 * Handles form validation, authentication,
 * and transition animations with Apple-like feel
 */

document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const form = document.getElementById('sign-in-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const signInButton = document.getElementById('sign-in-button');
    
    // Error message elements
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    
    // Toggle password button
    const togglePasswordButton = document.querySelector('.toggle-password');
    
    // Regular expressions for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    /**
     * Toggle password visibility
     */
    const setupPasswordToggle = () => {
      if (!togglePasswordButton) return;
      
      togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon
        if (type === 'text') {
          togglePasswordButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          `;
        } else {
          togglePasswordButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          `;
        }
      });
    };
    
    /**
     * Validate form inputs
     * @returns {boolean} Whether the form is valid
     */
    const validateForm = () => {
      let isValid = true;
      
      // Reset errors
      emailError.style.display = 'none';
      passwordError.style.display = 'none';
      emailInput.classList.remove('error');
      passwordInput.classList.remove('error');
      
      // Validate email
      if (!emailInput.value || !emailRegex.test(emailInput.value)) {
        emailError.style.display = 'block';
        emailInput.classList.add('error');
        isValid = false;
        
        // Apply subtle shake animation
        applyShakeAnimation(emailInput);
      }
      
      // Validate password
      if (!passwordInput.value) {
        passwordError.style.display = 'block';
        passwordInput.classList.add('error');
        isValid = false;
        
        // Apply subtle shake animation
        applyShakeAnimation(passwordInput);
      }
      
      return isValid;
    };
    
    /**
     * Apply a subtle shake animation to an element
     * @param {HTMLElement} element - Element to animate
     */
    const applyShakeAnimation = (element) => {
      element.classList.add('shake-animation');
      setTimeout(() => {
        element.classList.remove('shake-animation');
      }, 600);
    };
    
    /**
     * Simulate authentication
     * In a real app, this would call an API endpoint
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {boolean} remember - Remember me option
     * @returns {Promise} Auth result promise
     */
    const authenticateUser = (email, password, remember) => {
      return new Promise((resolve, reject) => {
        // Demo credentials - in a real app, this would be an API call
        if (email === 'demo@taskup.com' && password === 'Password123') {
          setTimeout(() => {
            resolve({
              success: true,
              user: {
                name: 'Demo User',
                email: 'demo@taskup.com',
                avatar: '/assets/images/branding/avatar-placeholder.png'
              }
            });
          }, 1500);
        } else {
          // Demo - simulate auth failure
          setTimeout(() => {
            reject({
              success: false,
              message: 'Invalid email or password'
            });
          }, 1500);
        }
      });
    };
    
    /**
     * Handle form submission
     */
    const setupFormSubmission = () => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
          return;
        }
        
        try {
          // Show loading state
          signInButton.textContent = 'Signing in...';
          signInButton.classList.add('loading');
          signInButton.disabled = true;
          
          // Get form values
          const email = emailInput.value;
          const password = passwordInput.value;
          const remember = rememberMeCheckbox ? rememberMeCheckbox.checked : false;
          
          // Attempt authentication
          const result = await authenticateUser(email, password, remember);
          
          // Handle successful authentication
          if (result.success) {
            // Store user data (in a real app, would store token)
            if (remember) {
              localStorage.setItem('auth_user', JSON.stringify(result.user));
            } else {
              sessionStorage.setItem('auth_user', JSON.stringify(result.user));
            }
            
            // Show success animation before redirect
            signInButton.textContent = 'Success!';
            signInButton.classList.remove('loading');
            signInButton.classList.add('success');
            
            // Redirect to dashboard after animation
            setTimeout(() => {
              window.location.href = '/app/dashboard.html';
            }, 1000);
          }
        } catch (error) {
          // Handle authentication failure
          signInButton.classList.remove('loading');
          signInButton.disabled = false;
          signInButton.textContent = 'Sign In';
          
          // Show error message
          showAuthError(error.message || 'Authentication failed');
          
          // For demo purposes, show hint
          if (!document.querySelector('.demo-hint')) {
            const hint = document.createElement('p');
            hint.className = 'demo-hint';
            hint.textContent = 'Hint: Use demo@taskup.com / Password123';
            hint.style.textAlign = 'center';
            hint.style.marginTop = '10px';
            hint.style.fontSize = '12px';
            hint.style.color = 'var(--color-text-tertiary)';
            form.appendChild(hint);
            
            // Animate hint entry
            hint.style.opacity = '0';
            hint.style.transform = 'translateY(10px)';
            hint.style.transition = 'opacity 0.3s ease, transform 0.3s var(--ease-spring-1)';
            
            setTimeout(() => {
              hint.style.opacity = '1';
              hint.style.transform = 'translateY(0)';
            }, 100);
          }
        }
      });
    };
    
    /**
     * Display authentication error
     * @param {string} message - Error message
     */
    const showAuthError = (message) => {
      // Create or get error element
      let errorElement = document.querySelector('.auth-error');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'auth-error';
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
      
      // Apply subtle shake to the form
      form.classList.add('shake-animation');
      setTimeout(() => {
        form.classList.remove('shake-animation');
      }, 600);
    };
    
    /**
     * Check for stored authentication
     * In a real app, this would validate the token with the server
     */
    const checkStoredAuth = () => {
      const storedUser = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          
          // If we have stored auth, redirect to dashboard
          window.location.href = '/app/dashboard.html';
        } catch (error) {
          // Invalid stored data, clear it
          localStorage.removeItem('auth_user');
          sessionStorage.removeItem('auth_user');
        }
      }
    };
    
    /**
     * Setup input event listeners
     */
    const setupInputListeners = () => {
      // Clear errors on input
      emailInput.addEventListener('input', () => {
        emailError.style.display = 'none';
        emailInput.classList.remove('error');
      });
      
      passwordInput.addEventListener('input', () => {
        passwordError.style.display = 'none';
        passwordInput.classList.remove('error');
      });
      
      // Update button state
      const updateButtonState = () => {
        if (emailInput.value && passwordInput.value) {
          signInButton.disabled = false;
        } else {
          signInButton.disabled = true;
        }
      };
      
      emailInput.addEventListener('input', updateButtonState);
      passwordInput.addEventListener('input', updateButtonState);
      
      // Initial check
      updateButtonState();
    };
    
    /**
     * Apply entry animations
     */
    const setupAnimations = () => {
      const formElements = [
        document.querySelector('.form-title'),
        document.querySelector('.form-subtitle'),
        emailInput.parentNode,
        passwordInput.parentNode,
        document.querySelector('.forgot-password'),
        document.querySelector('.remember-me'),
        signInButton,
        document.querySelector('.separator'),
        document.querySelector('.social-sign-in'),
        document.querySelector('.sign-up-link')
      ];
      
      formElements.forEach((element, index) => {
        if (element) {
          element.style.opacity = '0';
          element.style.transform = 'translateY(15px)';
          element.style.transition = 'opacity 0.4s ease, transform 0.4s var(--ease-spring-1)';
          
          setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
          }, 100 + (index * 70));
        }
      });
    };
    
    /**
     * Initialize the page
     */
    const init = () => {
      // Check if user is already authenticated
      checkStoredAuth();
      
      setupPasswordToggle();
      setupFormSubmission();
      setupInputListeners();
      setupAnimations();
      
      // Focus email input after animations
      setTimeout(() => {
        emailInput.focus();
      }, 800);
    };
    
    // Start initialization
    init();
    
    // Add custom styles for animations
    const style = document.createElement('style');
    style.textContent = `
      .auth-error {
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
      
      .success {
        background-color: var(--color-success) !important;
      }
    `;
    document.head.appendChild(style);
  });