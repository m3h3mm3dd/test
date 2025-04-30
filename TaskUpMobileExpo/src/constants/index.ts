
import AppInfo from './AppInfo';
import Screens from './Screens';

// Animation timing constants
const Animations = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN_OUT: 'easeInOut',
    EASE_OUT: 'easeOut',
    EASE_IN: 'easeIn',
    LINEAR: 'linear',
  },
};

// API endpoints
const API = {
  BASE_URL: 'https://api.taskup.com/v1',
  TIMEOUT: 10000, // 10 seconds
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      FORGOT_PASSWORD: '/auth/forgot-password',
      VERIFY_EMAIL: '/auth/verify-email',
    },
    TASKS: {
      GET_ALL: '/tasks',
      GET_ONE: '/tasks/',
      CREATE: '/tasks',
      UPDATE: '/tasks/',
      DELETE: '/tasks/',
    },
    PROJECTS: {
      GET_ALL: '/projects',
      GET_ONE: '/projects/',
      CREATE: '/projects',
      UPDATE: '/projects/',
      DELETE: '/projects/',
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE_PROFILE: '/user/profile',
      SETTINGS: '/user/settings',
    },
  },
};

// Storage keys
const Storage = {
  AUTH_TOKEN: '@TaskUp:authToken',
  USER_DATA: '@TaskUp:userData',
  SETTINGS: '@TaskUp:settings',
  THEME: '@TaskUp:theme',
  ONBOARDING_COMPLETED: '@TaskUp:onboardingCompleted',
};

// Form input validation messages
const ValidationMessages = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORD_REQUIREMENTS: 'Password must include uppercase, lowercase, number, and special character',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  USERNAME_REQUIREMENTS: 'Username must be 3-20 characters and only contain letters, numbers, underscore, or dash',
};

// App constants
const App = {
  DEFAULT_PAGINATION_LIMIT: 20,
  MAX_TITLE_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
  DEFAULT_AVATAR_COLOR: '#3D5AFE',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  SUPPORTED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
};

export {
  AppInfo,
  Screens,
  Animations,
  API,
  Storage,
  ValidationMessages,
  App,
};