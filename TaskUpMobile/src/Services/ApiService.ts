import axios, { AxiosRequestConfig } from 'axios';
import { ApiConfig } from '../Config/ApiConfig';
import { StorageUtils } from '../Utils/StorageUtils';

const api = axios.create({
  baseURL: ApiConfig.BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await StorageUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await StorageUtils.removeToken();
      // Handle logout or refresh token logic here
    }
    return Promise.reject(error);
  }
);

export class ApiService {
  static async login(email: string, password: string) {
    try {
      // For development purposes, simulate API call
      // Remove this in production and use the actual API call
      if (ApiConfig.USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              token: 'mock-token-12345',
              user: {
                id: '1',
                name: 'John Doe',
                email: email,
                role: 'admin',
                avatar: null,
              },
            });
          }, 800);
        });
      }

      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async register(userData: any) {
    try {
      if (ApiConfig.USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              success: true,
              user: {
                id: '1',
                name: userData.name,
                email: userData.email,
                role: 'user',
                avatar: null,
              },
            });
          }, 800);
        });
      }

      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      if (ApiConfig.USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true });
          }, 500);
        });
      }

      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  static async forgotPassword(email: string) {
    try {
      if (ApiConfig.USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true });
          }, 800);
        });
      }

      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  static async verifyOTP(email: string, otp: string) {
    try {
      if (ApiConfig.USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true });
          }, 800);
        });
      }

      const response = await api.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  static async resetPassword(email: string, password: string, token: string) {
    try {
      if (ApiConfig.USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true });
          }, 800);
        });
      }

      const response = await api.post('/auth/reset-password', {
        email,
        password,
        token,
      });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  static async getUserInfo() {
    try {
      if (ApiConfig.USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
              role: 'admin',
              avatar: null,
            });
          }, 500);
        });
      }

      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  static async updateUserProfile(userData: any) {
    try {
      if (ApiConfig.USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ...userData,
              id: '1',
            });
          }, 800);
        });
      }

      const response = await api.put('/user/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  static async getUnreadNotificationsCount() {
    try {
      if (ApiConfig.USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(3);
          }, 300);
        });
      }

      const response = await api.get('/notifications/unread/count');
      return response.data.count;
    } catch (error) {
      console.error('Get unread notifications count error:', error);
      throw error;
    }
  }

  static async markAllNotificationsAsRead() {
    try {
      if (ApiConfig.USE_MOCK) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true });
          }, 500);
        });
      }

      const response = await api.post('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }

  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.get<T>(url, config);
    return response.data;
  }

  static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.post<T>(url, data, config);
    return response.data;
  }

  static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.put<T>(url, data, config);
    return response.data;
  }

  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.delete<T>(url, config);
    return response.data;
  }
}