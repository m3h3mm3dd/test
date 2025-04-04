/**
 * OTP Verification page scripts for TaskUp
 * 
 * Handles OTP input behavior, verification, countdown timer,
 * and resend functionality with Apple-inspired interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const form = document.getElementById('otp-form');
    const verifyButton = document.getElementById('verify-button');
    const resendButton = document.getElementById('resend-button');
    const countdownTimer = document.getElementById('countdown-timer');
    const otpInputs = document.querySelectorAll('.otp-input');
    const errorMessage = document.getElementById('otp-error');
    
    // Timer variables
    let timeLeft = 119; // 1:59 in seconds
    let timerInterval;
    
    /**
     * Update the countdown timer display
     */
    const updateTimer = () => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      
      countdownTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (timeLeft === 0) {
        clearInterval(timerInterval);
        resendButton.removeAttribute('disabled');
        resendButton.classList.add('animate-pulse');
      } else {
        timeLeft--;
      }
    };
    
    /**
     * Start the countdown timer
     */
    const startTimer = () => {
      clearInterval(timerInterval);
      updateTimer(); // Update immediately to show correct time
      timerInterval = setInterval(updateTimer, 1000);
    };
    
    /**
     * Handle OTP input field behavior
     */
    const setupOtpInputs = () => {
      otpInputs.forEach((input, index) => {
        // Apply entry animation
        setTimeout(() => {
          input.style.opacity = '1';
          input.style.transform = 'translateY(0)';
        }, 100 + (index * 50));
        
        // Auto-focus next input on entry
        input.addEventListener('input', (e) => {
          // Allow only numbers
          const val = e.target.value;
          if (val && /^\d+$/.test(val)) {
            // Subtle scale animation on input
            input.style.transform = 'scale(1.05)';
            setTimeout(() => {
              input.style.transform = 'scale(1)';
            }, 150);
            
            // Move to the next input
            if (index < otpInputs.length - 1) {
              otpInputs[index + 1].focus();
            } else {
              // If last digit entered, check if form is complete
              checkOtpComplete();
              input.blur(); // Remove focus from the last input
              
              // Apply subtle shake animation to verify button to draw attention
              if (isFormComplete()) {
                verifyButton.classList.add('attention-pulse');
                setTimeout(() => {
                  verifyButton.classList.remove('attention-pulse');
                }, 600);
              }
            }
          } else {
            e.target.value = '';
          }
          
          // Check if all inputs are filled
          checkOtpComplete();
        });
        
        // Handle backspace key
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace') {
            // If current input is empty, focus previous input
            if (e.target.value === '' && index > 0) {
              otpInputs[index - 1].focus();
              // Prevent default to avoid navigating back in browser
              e.preventDefault();
            }
          }
        });
        
        // Handle paste event
        input.addEventListener('paste', (e) => {
          e.preventDefault();
          const pasteData = e.clipboardData.getData('text').trim();
          
          // Check if pasted data is numeric and has appropriate length
          if (/^\d+$/.test(pasteData)) {
            // Fill all inputs with respective digits
            [...pasteData].slice(0, otpInputs.length).forEach((digit, i) => {
              otpInputs[i].value = digit;
              
              // Apply subtle animation to each filled input
              otpInputs[i].style.transition = 'transform 0.15s var(--ease-spring-1)';
              otpInputs[i].style.transform = 'scale(1.05)';
              setTimeout(() => {
                otpInputs[i].style.transform = 'scale(1)';
              }, 150 + (i * 30));
            });
            
            // Focus appropriate input after paste
            const focusIndex = Math.min(pasteData.length, otpInputs.length - 1);
            otpInputs[focusIndex].focus();
            
            checkOtpComplete();
          }
        });
        
        // Clear error state on focus
        input.addEventListener('focus', () => {
          errorMessage.style.display = 'none';
          otpInputs.forEach(input => {
            input.classList.remove('error');
          });
        });
      });
    };
    
    /**
     * Check if the OTP is complete
     */
    const isFormComplete = () => {
      return Array.from(otpInputs).every(input => input.value !== '');
    };
    
    /**
     * Update verify button state based on form completeness
     */
    const checkOtpComplete = () => {
      if (isFormComplete()) {
        verifyButton.removeAttribute('disabled');
      } else {
        verifyButton.setAttribute('disabled', 'disabled');
      }
      
      // Hide error if user is typing
      errorMessage.style.display = 'none';
      otpInputs.forEach(input => {
        input.classList.remove('error');
      });
    };
    
    /**
     * Handle OTP form submission
     */
    const setupFormSubmission = () => {
      form.addEventListener('submit', (e) => {
        // Get the entered OTP
        const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');
        
        // For demo purposes only - validate against a fixed code
        // In a real application, this would be validated against the backend
        if (enteredOtp !== '123456') {
          e.preventDefault();
          
          errorMessage.style.display = 'block';
          otpInputs.forEach(input => {
            input.classList.add('error');
          });
          
          // Clear OTP fields with delay and focus first field
          setTimeout(() => {
            otpInputs.forEach(input => {
              input.value = '';
            });
            otpInputs[0].focus();
            verifyButton.setAttribute('disabled', 'disabled');
          }, 800);
        } else {
          // Show loading state on button
          verifyButton.innerHTML = 'Verifying...';
          verifyButton.classList.add('loading');
          
          // In a real app, would handle verification via fetch/ajax here
          // For demo, we'll just simulate a delay
          setTimeout(() => {
            window.location.href = 'sign-in.html';
          }, 1500);
        }
      });
    };
    
    /**
     * Handle resend code functionality
     */
    const setupResendButton = () => {
      resendButton.addEventListener('click', () => {
        // Show success animation
        resendButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Code sent!
        `;
        
        // Remove pulse animation
        resendButton.classList.remove('animate-pulse');
        
        // Show success toast
        showToast('Verification code resent to your email');
        
        // Reset timer
        timeLeft = 119;
        startTimer();
        
        // Disable resend button
        resendButton.setAttribute('disabled', 'disabled');
        
        // Reset button text after 3 seconds
        setTimeout(() => {
          resendButton.textContent = 'Resend Code';
        }, 3000);
      });
    };
    
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     */
    const showToast = (message) => {
      // Create toast element if it doesn't exist
      let toast = document.querySelector('.toast-notification');
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
      }
      
      // Set message
      toast.textContent = message;
      
      // Show toast with animation
      toast.classList.add('show');
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    };
    
    /**
     * Apply entry animations
     */
    const setupAnimations = () => {
      // Set initial state for OTP inputs
      otpInputs.forEach(input => {
        input.style.opacity = '0';
        input.style.transform = 'translateY(10px)';
        input.style.transition = 'opacity 0.3s ease, transform 0.3s var(--ease-spring-1)';
      });
      
      // Animate form elements
      const formElements = [
        document.querySelector('.email-sent-icon'),
        document.querySelector('.form-title'),
        document.querySelector('.form-subtitle'),
        document.querySelector('.otp-input-group'),
        verifyButton,
        document.querySelector('.resend-info'),
        resendButton,
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
          }, 100 + (index * 80));
        }
      });
    };
    
    /**
     * Initialize the page
     */
    const init = () => {
      setupOtpInputs();
      setupFormSubmission();
      setupResendButton();
      setupAnimations();
      startTimer();
      
      // Focus the first input on load after animation
      setTimeout(() => {
        otpInputs[0].focus();
      }, 500);
    };
    
    // Start initialization
    init();
    
    // Add some extra CSS for the animations
    const style = document.createElement('style');
    style.textContent = `
      .toast-notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background-color: var(--color-surface);
        color: var(--color-text-primary);
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        opacity: 0;
        transition: transform 0.5s var(--ease-spring-1), opacity 0.3s ease;
      }
      
      .toast-notification.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
      
      @keyframes attention-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .attention-pulse {
        animation: attention-pulse 0.6s var(--ease-spring-1);
      }
    `;
    document.head.appendChild(style);
  });