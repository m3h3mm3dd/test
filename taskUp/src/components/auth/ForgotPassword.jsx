import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('request'); // 'request', 'verification', 'reset'
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
    general: ''
  });
  
  const navigate = useNavigate();
  
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return { minLength, hasUppercase, hasSpecialChar, valid: minLength && hasUppercase && hasSpecialChar };
  };
  
  const handleRequestReset = (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      email: '',
      otp: '',
      password: '',
      confirmPassword: '',
      general: ''
    });
    
    // Validate email
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    } else if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('verification');
      
      // In a real app, you would send the reset request to your API
      // const response = await requestPasswordReset(email);
      // if (response.success) {
      //   setStep('verification');
      // } else {
      //   setErrors(prev => ({ ...prev, general: response.message }));
      // }
    }, 1000);
  };
  
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-reset-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };
  
  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-reset-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };
  
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      email: '',
      otp: '',
      password: '',
      confirmPassword: '',
      general: ''
    });
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setErrors(prev => ({ ...prev, otp: 'Please enter all 6 digits' }));
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('reset');
      
      // In a real app, you would verify the OTP through an API call
      // const response = await verifyOtp(email, otpValue);
      // if (response.success) {
      //   setStep('reset');
      // } else {
      //   setErrors(prev => ({ ...prev, otp: response.message }));
      // }
    }, 1000);
  };
  
  const handleResetPassword = (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      email: '',
      otp: '',
      password: '',
      confirmPassword: '',
      general: ''
    });
    
    // Validate password
    if (!newPassword) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }
    
    const pwdValidation = validatePassword(newPassword);
    if (!pwdValidation.valid) {
      let passwordError = 'Password must contain:';
      if (!pwdValidation.minLength) passwordError += ' at least 8 characters,';
      if (!pwdValidation.hasUppercase) passwordError += ' an uppercase letter,';
      if (!pwdValidation.hasSpecialChar) passwordError += ' a special character,';
      
      setErrors(prev => ({ ...prev, password: passwordError.slice(0, -1) }));
      return;
    }
    
    // Validate confirm password
    if (newPassword !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      // In a real app, you would reset the password through an API call
      // const response = await resetPassword(email, otpValue, newPassword);
      // if (response.success) {
      //   navigate('/login', { state: { message: 'Password reset successful. Please log in with your new password.' } });
      // } else {
      //   setErrors(prev => ({ ...prev, general: response.message }));
      // }
      
      navigate('/login', { state: { message: 'Password reset successful. Please log in with your new password.' } });
    }, 1000);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl animate-pulse" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white animate-fade-in">
          {step === 'request' && 'Reset your password'}
          {step === 'verification' && 'Verify your identity'}
          {step === 'reset' && 'Create new password'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 animate-fade-in" style={{animationDelay: '100ms'}}>
          {step === 'request' && 'Enter your email address to receive a verification code'}
          {step === 'verification' && `We've sent a 6-digit code to ${email}`}
          {step === 'reset' && 'Choose a strong password that you haven\'t used before'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in" style={{animationDelay: '200ms'}}>
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 transform transition-all duration-300 hover:shadow-xl">
          {errors.general && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md text-sm animate-shake">
              {errors.general}
            </div>
          )}
          
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fade-in">{errors.email}</p>
                  )}
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-transform hover:scale-105 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Sending...' : 'Send reset code'}
                </button>
              </div>
              
              <div className="text-center text-sm">
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}
          
          {step === 'verification' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter verification code
                </label>
                <div className="mt-2 flex justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-reset-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg transform transition-transform focus:scale-110"
                      style={{animationDelay: `${index * 50}ms`}}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fade-in">{errors.otp}</p>
                )}
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-transform hover:scale-105 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
              
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Go back
                </button>
                <span className="mx-2 text-gray-500">•</span>
                <ResendOtpButton />
              </div>
            </form>
          )}
          
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pr-10 transition-colors duration-200`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fade-in">{errors.password}</p>
                  )}
                  {!errors.password && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Must be at least 8 characters with 1 uppercase letter and 1 special character
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pr-10 transition-colors duration-200`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-fade-in">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-transform hover:scale-105 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Resetting password...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// OTP Resend Button with countdown timer
const ResendOtpButton = () => {
  const [countdown, setCountdown] = React.useState(60);
  const [isActive, setIsActive] = React.useState(true);
  
  React.useEffect(() => {
    let interval = null;
    if (isActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown => countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, countdown]);
  
  const handleResend = () => {
    // Simulate OTP resend
    setCountdown(60);
    setIsActive(true);
  };
  
  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={isActive}
      className={`font-medium ${isActive ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'}`}
    >
      {isActive ? `Resend code (${countdown}s)` : 'Resend code'}
    </button>
  );
};

// Add these styles to index.css or a separate CSS file
const additionalStyles = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
`;

export default ForgotPassword;