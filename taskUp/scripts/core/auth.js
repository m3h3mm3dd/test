/**
 * Authentication Service for TaskUp
 * 
 * Handles user authentication, sessions, and authorization
 * Works with the API client to manage auth tokens
 */

import api, { endpoints } from './api.js';
import { showToast } from '../utils/notifications.js';
import { storage } from '../utils/storage.js';

// Storage keys
const TOKEN_KEY = 'taskup_auth_token';
const REFRESH_TOKEN_KEY = 'taskup_refresh_token';
const USER_KEY = 'taskup_user';

// Auth events
export const AUTH_EVENTS = {
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
  TOKEN_REFRESH: 'auth:token:refresh',
  USER_UPDATE: 'auth:user:update',
  SESSION_EXPIRED: 'auth:session:expired',
  AUTH_ERROR: 'auth:error'
};

// Default user state
const DEFAULT_USER_STATE = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  tokenExpiry: null
};

/**
 * Authentication service class
 */
class AuthService {
  constructor() {
    // Initialize auth state
    this.authState = {
      ...DEFAULT_USER_STATE
    };
    
    // Session checking timer
    this.sessionCheckTimer = null;
    
    // Event listeners
    this.listeners = {
      [AUTH_EVENTS.LOGIN]: [],
      [AUTH_EVENTS.LOGOUT]: [],
      [AUTH_EVENTS.TOKEN_REFRESH]: [],
      [AUTH_EVENTS.USER_UPDATE]: [],
      [AUTH_EVENTS.SESSION_EXPIRED]: [],
      [AUTH_EVENTS.AUTH_ERROR]: []
    };
    
    // Token refresh settings
    this.refreshTokenThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
  }
  
  /**
   * Initialize the auth service and restore session if available
   */
  async initialize() {
    try {
      const token = storage.get(TOKEN_KEY);
      const refreshToken = storage.get(REFRESH_TOKEN_KEY);
      const user = storage.get(USER_KEY);
      
      if (token && user) {
        this.setSession(token, refreshToken, user);
        await this.validateSession();
      }
    } catch (error) {
      console.error('Failed to initialize auth service:', error);
      this.clearSession();
    }
  }
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - API response
   */
  async register(userData) {
    try {
      const response = await api.post(endpoints.auth.register, userData);
      
      // Some APIs return tokens immediately after registration
      if (response.token) {
        await this.handleAuthResponse(response);
        showToast('Account created successfully!', 'success');
      } else {
        showToast('Account created! Please verify your email.', 'success');
      }
      
      return response;
    } catch (error) {
      this.handleAuthError(error, 'Registration failed');
      throw error;
    }
  }
  
  /**
   * Log in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} remember - Remember user (for refresh token)
   * @returns {Promise} - Auth response with user data and tokens
   */
  async login(email, password, remember = false) {
    try {
      const response = await api.post(endpoints.auth.login, {
        email,
        password,
        remember
      });
      
      await this.handleAuthResponse(response);
      showToast(`Welcome back, ${response.user.firstName || response.user.name || 'User'}!`, 'success');
      
      return response;
    } catch (error) {
      this.handleAuthError(error, 'Login failed');
      throw error;
    }
  }
  
  /**
   * Log out the current user
   * @param {boolean} serverSide - Whether to notify the server
   * @returns {Promise} - Logout response
   */
  async logout(serverSide = true) {
    try {
      if (serverSide && this.isAuthenticated()) {
        await api.post(endpoints.auth.logout);
      }
    } catch (error) {
      console.warn('Logout from server failed:', error);
    } finally {
      this.clearSession();
      showToast('You have been logged out', 'info');
    }
  }
  
  /**
   * Request a password reset
   * @param {string} email - User email
   * @returns {Promise} - API response
   */
  async requestPasswordReset(email) {
    try {
      const response = await api.post(endpoints.auth.resetPassword, { email });
      showToast('Password reset email sent!', 'success');
      return response;
    } catch (error) {
      this.handleAuthError(error, 'Failed to send reset email');
      throw error;
    }
  }
  
  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise} - API response
   */
  async resetPassword(token, password, confirmPassword) {
    try {
      const response = await api.post(`${endpoints.auth.resetPassword}/confirm`, {
        token,
        password,
        confirmPassword
      });
      
      showToast('Password reset successful!', 'success');
      return response;
    } catch (error) {
      this.handleAuthError(error, 'Password reset failed');
      throw error;
    }
  }
  
  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise} - API response
   */
  async verifyEmail(token) {
    try {
      const response = await api.post(endpoints.auth.verifyEmail, { token });
      showToast('Email verified successfully!', 'success');
      return response;
    } catch (error) {
      this.handleAuthError(error, 'Email verification failed');
      throw error;
    }
  }
  
  /**
   * Get current user profile
   * @returns {Promise} - User data
   */
  async getUserProfile() {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      const user = await api.get(endpoints.auth.me);
      this.updateUser(user);
      return user;
    } catch (error) {
      if (error.status === 401) {
        this.handleSessionExpired();
      }
      throw error;
    }
  }
  
  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise} - Updated user data
   */
  async updateUserProfile(userData) {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      const updatedUser = await api.put(endpoints.users.profile, userData);
      this.updateUser(updatedUser);
      showToast('Profile updated successfully!', 'success');
      return updatedUser;
    } catch (error) {
      this.handleAuthError(error, 'Failed to update profile');
      throw error;
    }
  }
  
  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} - API response
   */
  async changePassword(currentPassword, newPassword) {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      const response = await api.put(`${endpoints.users.profile}/password`, {
        currentPassword,
        newPassword
      });
      
      showToast('Password changed successfully!', 'success');
      return response;
    } catch (error) {
      this.handleAuthError(error, 'Failed to change password');
      throw error;
    }
  }
  
  /**
   * Upload user avatar
   * @param {File} file - Avatar image file
   * @param {Function} progressCallback - Upload progress callback
   * @returns {Promise} - Updated user data with avatar
   */
  async uploadAvatar(file, progressCallback) {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const updatedUser = await api.upload(endpoints.users.avatar, formData, progressCallback);
      this.updateUser(updatedUser);
      
      showToast('Avatar updated successfully!', 'success');
      return updatedUser;
    } catch (error) {
      this.handleAuthError(error, 'Failed to upload avatar');
      throw error;
    }
  }
  
  /**
   * Refresh the auth token
   * @returns {Promise} - New token
   */
  async refreshToken() {
    if (!this.authState.refreshToken) {
      this.handleSessionExpired();
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await api.post(endpoints.auth.refreshToken, {
        refreshToken: this.authState.refreshToken
      });
      
      const { token, refreshToken, expiresIn } = response;
      this.setToken(token, refreshToken, expiresIn);
      
      this.emit(AUTH_EVENTS.TOKEN_REFRESH, { token });
      return token;
    } catch (error) {
      this.handleSessionExpired();
      throw error;
    }
  }
  
  /**
   * Handle auth response from login or token refresh
   * @param {Object} response - Auth response with tokens and user data
   * @private
   */
  async handleAuthResponse(response) {
    const { token, refreshToken, user, expiresIn } = response;
    this.setSession(token, refreshToken, user, expiresIn);
    
    // Emit login event
    this.emit(AUTH_EVENTS.LOGIN, {
      user: this.authState.user
    });
  }
  
  /**
   * Set the current session
   * @param {string} token - JWT auth token
   * @param {string} refreshToken - Refresh token
   * @param {Object} user - User data
   * @param {number} expiresIn - Token expiration in seconds
   * @private
   */
  setSession(token, refreshToken, user, expiresIn = 3600) {
    // Set auth state
    this.authState.isAuthenticated = true;
    this.authState.token = token;
    this.authState.refreshToken = refreshToken;
    this.authState.user = user;
    
    // Calculate token expiry
    const expiryMs = expiresIn * 1000;
    this.authState.tokenExpiry = Date.now() + expiryMs;
    
    // Store in persistent storage
    storage.set(TOKEN_KEY, token);
    if (refreshToken) {
      storage.set(REFRESH_TOKEN_KEY, refreshToken);
    }
    storage.set(USER_KEY, user);
    
    // Set auth token in API client
    api.setAuthToken(token);
    
    // Start session check timer
    this.startSessionCheck();
  }
  
  /**
   * Update just the auth token
   * @param {string} token - New JWT auth token
   * @param {string} refreshToken - New refresh token
   * @param {number} expiresIn - Token expiration in seconds
   * @private
   */
  setToken(token, refreshToken, expiresIn = 3600) {
    this.authState.token = token;
    if (refreshToken) {
      this.authState.refreshToken = refreshToken;
      storage.set(REFRESH_TOKEN_KEY, refreshToken);
    }
    
    // Calculate token expiry
    const expiryMs = expiresIn * 1000;
    this.authState.tokenExpiry = Date.now() + expiryMs;
    
    // Store in persistent storage
    storage.set(TOKEN_KEY, token);
    
    // Set auth token in API client
    api.setAuthToken(token);
    
    // Restart session check timer
    this.startSessionCheck();
  }
  
  /**
   * Update user data
   * @param {Object} user - Updated user data
   * @private
   */
  updateUser(user) {
    this.authState.user = {
      ...this.authState.user,
      ...user
    };
    
    storage.set(USER_KEY, this.authState.user);
    
    this.emit(AUTH_EVENTS.USER_UPDATE, {
      user: this.authState.user
    });
  }
  
  /**
   * Clear the current session
   * @private
   */
  clearSession() {
    // Clear auth state
    this.authState = { ...DEFAULT_USER_STATE };
    
    // Clear storage
    storage.remove(TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
    storage.remove(USER_KEY);
    
    // Reset API client
    api.setAuthToken(null);
    
    // Stop session check
    this.stopSessionCheck();
    
    // Emit logout event
    this.emit(AUTH_EVENTS.LOGOUT);
  }
  
  /**
   * Start the session check timer
   * @private
   */
  startSessionCheck() {
    this.stopSessionCheck();
    
    // Check session every minute
    this.sessionCheckTimer = setInterval(() => {
      this.checkSession();
    }, 60 * 1000);
  }
  
  /**
   * Stop the session check timer
   * @private
   */
  stopSessionCheck() {
    if (this.sessionCheckTimer) {
      clearInterval(this.sessionCheckTimer);
      this.sessionCheckTimer = null;
    }
  }
  
  /**
   * Check if the current session is valid
   * @private
   */
  async checkSession() {
    if (!this.isAuthenticated() || !this.authState.tokenExpiry) {
      return;
    }
    
    const currentTime = Date.now();
    const timeUntilExpiry = this.authState.tokenExpiry - currentTime;
    
    // If token is expired, handle session expiry
    if (timeUntilExpiry <= 0) {
      this.handleSessionExpired();
      return;
    }
    
    // If token is close to expiry, refresh it
    if (timeUntilExpiry <= this.refreshTokenThreshold) {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }
  }
  
  /**
   * Validate the current session with the server
   * @returns {Promise<boolean>} - Whether the session is valid
   * @private
   */
  async validateSession() {
    try {
      if (!this.isAuthenticated()) {
        return false;
      }
      
      await this.getUserProfile();
      return true;
    } catch (error) {
      // If unauthorized or forbidden, clear session
      if (error.status === 401 || error.status === 403) {
        this.clearSession();
      }
      return false;
    }
  }
  
  /**
   * Handle session expired event
   * @private
   */
  handleSessionExpired() {
    this.clearSession();
    this.emit(AUTH_EVENTS.SESSION_EXPIRED);
  }
  
  /**
   * Handle authentication error
   * @param {Error} error - Error object
   * @param {string} defaultMessage - Default error message
   * @private
   */
  handleAuthError(error, defaultMessage = 'Authentication error') {
    // Emit auth error event
    this.emit(AUTH_EVENTS.AUTH_ERROR, {
      error,
      message: error.message || defaultMessage
    });
    
    // Show error toast
    let errorMessage = defaultMessage;
    
    if (error.data && error.data.message) {
      errorMessage = error.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    showToast(errorMessage, 'error');
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean} - Whether user is authenticated
   */
  isAuthenticated() {
    return this.authState.isAuthenticated && !!this.authState.token;
  }
  
  /**
   * Get current user
   * @returns {Object|null} - User data or null if not authenticated
   */
  getUser() {
    return this.authState.user;
  }
  
  /**
   * Get user role
   * @returns {string|null} - User role or null
   */
  getUserRole() {
    return this.authState.user ? this.authState.user.role : null;
  }
  
  /**
   * Check if user has a specific role
   * @param {string|Array} roles - Role or roles to check
   * @returns {boolean} - Whether user has the role
   */
  hasRole(roles) {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    
    return userRole === roles;
  }
  
  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }
  
  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback to remove
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
  
  /**
   * Emit event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @private
   */
  emit(event, data = {}) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}

// Create and export singleton instance
const auth = new AuthService();
export default auth;