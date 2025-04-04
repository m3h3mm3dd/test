/**
 * API Client for TaskUp Backend
 * 
 * Handles all API requests to the backend using fetch API
 * Provides consistent error handling and response parsing
 */

// API Configuration
const API_CONFIG = {
    // Base URL for API endpoints
    BASE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://api.taskup.app/v1' 
      : 'http://localhost:3000/api/v1',
    
    // Default request headers
    HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    
    // Request timeout in milliseconds
    TIMEOUT: 30000
  };
  
  /**
   * Request timeout wrapper for fetch
   * @param {number} timeout - Timeout in milliseconds
   * @param {Promise} promise - Fetch promise
   * @returns {Promise} - Promise that resolves or rejects based on race condition
   */
  const timeoutPromise = (timeout, promise) => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeout);
      
      promise.then(
        (res) => {
          clearTimeout(timeoutId);
          resolve(res);
        },
        (err) => {
          clearTimeout(timeoutId);
          reject(err);
        }
      );
    });
  };
  
  /**
   * Main API client class
   */
  class ApiClient {
    constructor() {
      this.baseUrl = API_CONFIG.BASE_URL;
      this.headers = { ...API_CONFIG.HEADERS };
      this.timeout = API_CONFIG.TIMEOUT;
    }
    
    /**
     * Set the authorization token for API requests
     * @param {string} token - JWT auth token
     */
    setAuthToken(token) {
      if (token) {
        this.headers['Authorization'] = `Bearer ${token}`;
      } else {
        delete this.headers['Authorization'];
      }
    }
    
    /**
     * Parse API response
     * @param {Response} response - Fetch Response object
     * @returns {Promise} - Parsed response data or error
     */
    async parseResponse(response) {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (!response.ok) {
          const error = new Error(data.message || 'API Error');
          error.status = response.status;
          error.data = data;
          throw error;
        }
        
        return data;
      }
      
      if (!response.ok) {
        const error = new Error('API Error');
        error.status = response.status;
        throw error;
      }
      
      return await response.text();
    }
    
    /**
     * Execute API request
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
     * @param {string} endpoint - API endpoint path
     * @param {Object} data - Request payload for POST/PUT requests
     * @param {Object} customConfig - Custom fetch configuration
     * @returns {Promise} - Parsed response
     */
    async request(method, endpoint, data = null, customConfig = {}) {
      const url = `${this.baseUrl}${endpoint}`;
      
      const config = {
        method,
        headers: { ...this.headers },
        ...customConfig
      };
      
      if (data) {
        config.body = JSON.stringify(data);
      }
      
      try {
        const response = await timeoutPromise(
          this.timeout,
          fetch(url, config)
        );
        return await this.parseResponse(response);
      } catch (error) {
        // Log error for debugging
        console.error('API request failed:', error);
        
        // Enhance error with more context
        error.endpoint = endpoint;
        error.method = method;
        
        // Handle offline status
        if (!navigator.onLine) {
          error.offline = true;
          error.message = 'You are offline. Please check your internet connection.';
        }
        
        throw error;
      }
    }
    
    // HTTP method convenience functions
    
    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} customConfig - Custom config
     * @returns {Promise} - Response data
     */
    get(endpoint, customConfig = {}) {
      return this.request('GET', endpoint, null, customConfig);
    }
    
    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request payload
     * @param {Object} customConfig - Custom config
     * @returns {Promise} - Response data
     */
    post(endpoint, data, customConfig = {}) {
      return this.request('POST', endpoint, data, customConfig);
    }
    
    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request payload
     * @param {Object} customConfig - Custom config
     * @returns {Promise} - Response data
     */
    put(endpoint, data, customConfig = {}) {
      return this.request('PUT', endpoint, data, customConfig);
    }
    
    /**
     * PATCH request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request payload
     * @param {Object} customConfig - Custom config
     * @returns {Promise} - Response data
     */
    patch(endpoint, data, customConfig = {}) {
      return this.request('PATCH', endpoint, data, customConfig);
    }
    
    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @param {Object} customConfig - Custom config
     * @returns {Promise} - Response data
     */
    delete(endpoint, customConfig = {}) {
      return this.request('DELETE', endpoint, null, customConfig);
    }
    
    /**
     * Upload file(s)
     * @param {string} endpoint - API endpoint
     * @param {FormData} formData - Form data with files
     * @param {Function} progressCallback - Progress callback function
     * @returns {Promise} - Response data
     */
    upload(endpoint, formData, progressCallback = null) {
      const config = {
        method: 'POST',
        headers: { ...this.headers },
        body: formData
      };
      
      // Remove Content-Type header to let browser set it with boundary
      delete config.headers['Content-Type'];
      
      if (progressCallback && typeof progressCallback === 'function') {
        // Use XMLHttpRequest for progress tracking
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.open('POST', `${this.baseUrl}${endpoint}`);
          
          // Set headers
          Object.keys(config.headers).forEach(key => {
            xhr.setRequestHeader(key, config.headers[key]);
          });
          
          // Handle progress events
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              progressCallback(percentComplete);
            }
          });
          
          // Handle completion
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (e) {
                resolve(xhr.responseText);
              }
            } else {
              try {
                const error = JSON.parse(xhr.responseText);
                reject(new Error(error.message || 'Upload failed'));
              } catch (e) {
                reject(new Error('Upload failed'));
              }
            }
          };
          
          // Handle errors
          xhr.onerror = () => {
            reject(new Error('Network error during upload'));
          };
          
          // Handle timeout
          xhr.timeout = this.timeout;
          xhr.ontimeout = () => {
            reject(new Error('Upload timeout'));
          };
          
          // Send the request
          xhr.send(formData);
        });
      }
      
      // Use regular fetch if no progress tracking is needed
      return this.request('POST', endpoint, null, config);
    }
  }
  
  // Create and export API client instance
  const api = new ApiClient();
  export default api;
  
  // API endpoints for different resources
  export const endpoints = {
    // Auth endpoints
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      resetPassword: '/auth/reset-password',
      verifyEmail: '/auth/verify-email',
      refreshToken: '/auth/refresh-token',
      me: '/auth/me'
    },
    
    // User endpoints
    users: {
      base: '/users',
      profile: '/users/profile',
      settings: '/users/settings',
      avatar: '/users/avatar'
    },
    
    // Project endpoints
    projects: {
      base: '/projects',
      get: (id) => `/projects/${id}`,
      tasks: (id) => `/projects/${id}/tasks`,
      members: (id) => `/projects/${id}/members`,
      activity: (id) => `/projects/${id}/activity`,
      statistics: (id) => `/projects/${id}/statistics`
    },
    
    // Task endpoints
    tasks: {
      base: '/tasks',
      get: (id) => `/tasks/${id}`,
      comments: (id) => `/tasks/${id}/comments`,
      attachments: (id) => `/tasks/${id}/attachments`,
      assignees: (id) => `/tasks/${id}/assignees`,
      subtasks: (id) => `/tasks/${id}/subtasks`,
      history: (id) => `/tasks/${id}/history`
    },
    
    // Team endpoints
    teams: {
      base: '/teams',
      get: (id) => `/teams/${id}`,
      members: (id) => `/teams/${id}/members`,
      projects: (id) => `/teams/${id}/projects`,
      invitations: (id) => `/teams/${id}/invitations`
    },
    
    // Comment endpoints
    comments: {
      base: '/comments',
      get: (id) => `/comments/${id}`,
      replies: (id) => `/comments/${id}/replies`
    },
    
    // Notification endpoints
    notifications: {
      base: '/notifications',
      markAsRead: '/notifications/mark-read',
      settings: '/notifications/settings'
    },
    
    // Search endpoint
    search: '/search',
    
    // Dashboard endpoint
    dashboard: '/dashboard'
  };