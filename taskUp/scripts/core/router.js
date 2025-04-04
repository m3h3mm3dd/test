/**
 * Client-side Router for TaskUp
 * 
 * A lightweight router for handling client-side navigation
 * without requiring a full framework
 */

import store, { ActionTypes } from './state.js';
import auth from './auth.js';

// Route change event name
const ROUTE_CHANGE_EVENT = 'route:change';

// Route guards
const GUARDS = {
  AUTH: 'auth',
  GUEST: 'guest',
  ADMIN: 'admin'
};

/**
 * Router class for handling client-side navigation
 */
class Router {
  constructor() {
    // Routes configuration
    this.routes = [];
    
    // Current route
    this.currentRoute = null;
    
    // Event listeners
    this.listeners = {
      [ROUTE_CHANGE_EVENT]: []
    };
    
    // Reference to the last route guard error handler that was executed
    this.lastGuardErrorHandler = null;
  }
  
  /**
   * Initialize the router
   */
  init() {
    // Handle initial route
    this.handleRouteChange();
    
    // Listen for URL changes
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });
    
    // Handle link clicks
    document.addEventListener('click', (e) => {
      // Find closest anchor tag
      const anchor = e.target.closest('a');
      
      if (
        anchor && 
        anchor.getAttribute('href') && 
        anchor.getAttribute('href').startsWith('/') && 
        !anchor.getAttribute('external') &&
        !anchor.hasAttribute('target')
      ) {
        e.preventDefault();
        this.navigate(anchor.getAttribute('href'));
      }
    });
  }
  
  /**
   * Register a route
   * @param {Object} route - Route configuration
   * @param {string} route.path - URL path (supports dynamic segments with :param)
   * @param {Function} route.handler - Route handler function
   * @param {string} [route.guard] - Route guard (auth, guest, admin)
   * @param {Function} [route.guardErrorHandler] - Function to handle guard failure
   * @param {string} [route.title] - Page title
   */
  register(route) {
    // Convert path parameter syntax to regex
    const pathPattern = route.path
      .replace(/:[a-zA-Z0-9_]+/g, '([^/]+)')
      .replace(/\//g, '\\/');
    
    // Create route object with regex pattern
    const routeObj = {
      ...route,
      pattern: new RegExp(`^${pathPattern}$`)
    };
    
    // Add to routes collection
    this.routes.push(routeObj);
  }
  
  /**
   * Register multiple routes
   * @param {Array} routes - Array of route configurations
   */
  registerRoutes(routes) {
    routes.forEach(route => this.register(route));
  }
  
  /**
   * Navigate to a new route
   * @param {string} path - Path to navigate to
   * @param {Object} [state] - State to push to history
   * @param {Object} [options] - Navigation options
   * @param {boolean} [options.replace=false] - Replace current history entry
   */
  navigate(path, state = {}, options = {}) {
    // Update browser history
    if (options.replace) {
      window.history.replaceState(state, '', path);
    } else {
      window.history.pushState(state, '', path);
    }
    
    // Handle route change
    this.handleRouteChange();
  }
  
  /**
   * Navigate back in history
   */
  back() {
    window.history.back();
  }
  
  /**
   * Handle route change
   * @private
   */
  async handleRouteChange() {
    // Get current path
    const path = window.location.pathname;
    
    // Find matching route
    const route = this.findRoute(path);
    
    if (!route) {
      // Route not found, navigate to 404
      this.showNotFound();
      return;
    }
    
    // Extract route params
    const params = this.extractRouteParams(route, path);
    
    // Get route guards
    if (route.guard) {
      const guardPassed = await this.checkGuard(route.guard);
      
      if (!guardPassed) {
        // Use route's specific guard error handler if provided
        if (route.guardErrorHandler) {
          this.lastGuardErrorHandler = route.guardErrorHandler;
          route.guardErrorHandler();
        } else if (this.lastGuardErrorHandler) {
          // Run the last guard error handler again
          this.lastGuardErrorHandler();
        }
        return;
      }
    }
    
    // Update current route
    this.currentRoute = {
      path,
      params,
      route
    };
    
    // Update page title
    if (route.title) {
      document.title = `${route.title} - TaskUp`;
    } else {
      document.title = 'TaskUp - Project Management Simplified';
    }
    
    // Update UI state
    store.dispatch({
      type: ActionTypes.UI_MODAL_CLOSE
    });
    
    // Execute route handler
    try {
      await route.handler(params);
      
      // Dispatch route change event
      this.emit(ROUTE_CHANGE_EVENT, this.currentRoute);
      
      // Scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error handling route:', error);
      this.showError();
    }
  }
  
  /**
   * Find a matching route for a path
   * @param {string} path - URL path
   * @returns {Object|null} - Matching route or null
   * @private
   */
  findRoute(path) {
    return this.routes.find(route => route.pattern.test(path));
  }
  
  /**
   * Extract parameters from route path
   * @param {Object} route - Route object
   * @param {string} path - URL path
   * @returns {Object} - Route parameters
   * @private
   */
  extractRouteParams(route, path) {
    const params = {};
    
    // Match dynamic parts
    const pathParts = path.split('/').filter(Boolean);
    const routeParts = route.path.split('/').filter(Boolean);
    
    routeParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.substring(1);
        params[paramName] = pathParts[index];
      }
    });
    
    return params;
  }
  
  /**
   * Check if the route guard passes
   * @param {string} guard - Guard name
   * @returns {boolean} - Whether guard passes
   * @private
   */
  async checkGuard(guard) {
    switch (guard) {
      case GUARDS.AUTH:
        return auth.isAuthenticated();
        
      case GUARDS.GUEST:
        return !auth.isAuthenticated();
        
      case GUARDS.ADMIN:
        return auth.isAuthenticated() && auth.hasRole('admin');
        
      default:
        return true;
    }
  }
  
  /**
   * Show 404 not found page
   * @private
   */
  showNotFound() {
    // Navigate to 404 page
    this.navigate('/system/404', {}, { replace: true });
  }
  
  /**
   * Show error page
   * @private
   */
  showError() {
    // Navigate to error page
    this.navigate('/system/error', {}, { replace: true });
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
  
  /**
   * Get current route information
   * @returns {Object|null} - Current route or null
   */
  getCurrentRoute() {
    return this.currentRoute;
  }
}

// Create router instance
const router = new Router();

// Define route guards with redirection
const authGuardHandler = () => {
  router.navigate('/auth/sign-in', { returnTo: window.location.pathname });
};

const guestGuardHandler = () => {
  router.navigate('/app/dashboard');
};

const adminGuardHandler = () => {
  router.navigate('/app/dashboard');
};

// Define routes
const routes = [
  // Public routes
  {
    path: '/',
    handler: () => {
      // Load landing page module
      import('../pages/landing.js')
        .then(module => module.default())
        .catch(error => console.error('Failed to load landing page:', error));
    },
    title: 'Project Management Simplified'
  },
  
  // Auth routes
  {
    path: '/auth/sign-in',
    handler: (params) => {
      // Load sign-in module
      import('../pages/auth/sign-in.js')
        .then(module => module.default(params))
        .catch(error => console.error('Failed to load sign-in page:', error));
    },
    guard: GUARDS.GUEST,
    guardErrorHandler: guestGuardHandler,
    title: 'Sign In'
  },
  {
    path: '/auth/sign-up',
    handler: () => {
      // Load sign-up module
      import('../pages/auth/sign-up.js')
        .then(module => module.default())
        .catch(error => console.error('Failed to load sign-up page:', error));
    },
    guard: GUARDS.GUEST,
    guardErrorHandler: guestGuardHandler,
    title: 'Sign Up'
  },
  {
    path: '/auth/password-reset',
    handler: () => {
      // Load password reset module
      import('../pages/auth/reset.js')
        .then(module => module.default())
        .catch(error => console.error('Failed to load password reset page:', error));
    },
    title: 'Reset Password'
  },
  {
    path: '/auth/otp-verification',
    handler: () => {
      // Load OTP verification module
      import('../pages/auth/otp.js')
        .then(module => module.default())
        .catch(error => console.error('Failed to load OTP verification page:', error));
    },
    title: 'Verify Email'
  },
  
  // App routes (authenticated)
  {
    path: '/app/dashboard',
    handler: () => {
      // Load dashboard module
      import('../pages/dashboard/home.js')
        .then(module => module.default())
        .catch(error => console.error('Failed to load dashboard page:', error));
    },
    guard: GUARDS.AUTH,
    guardErrorHandler: authGuardHandler,
    title: 'Dashboard'
  },
  {
    path: '/app/projects/list',
    handler: () => {
      // Load projects list module
      import('../pages/projects/list.js')
        .then(module => module.default())
        .catch(error => console.error('Failed to load projects page:', error));
    },
    guard: GUARDS.AUTH,
    guardErrorHandler: authGuardHandler,
    title: 'Projects'
  },
  {
    path: '/app/projects/:id',
    handler: (params) => {
      // Load project details module with project ID
      import('../pages/projects/detail.js')
        .then(module => module.default(params))
        .catch(error => console.error('Failed to load project details page:', error));
    },
    guard: GUARDS.AUTH,
    guardErrorHandler: authGuardHandler,
    title: 'Project Details'
  },
  {
    path: '/app/tasks/my-tasks',
    handler: () => {
      // Load my tasks module
      import('../pages/tasks/list.js')
        .then(module => module.default({ filter: 'assigned' }))
        .catch(error => console.error('Failed to load tasks page:', error));
    },
    guard: GUARDS.AUTH,
    guardErrorHandler: authGuardHandler,
    title: 'My Tasks'
  },
  {
    path: '/app/tasks/:id',
    handler: (params) => {
      // Load task details module with task ID
      import('../pages/tasks/detail.js')
        .then(module => module.default(params))
        .catch(error => console.error('Failed to load task details page:', error));
    },
    guard: GUARDS.AUTH,
    guardErrorHandler: authGuardHandler,
    title: 'Task Details'
  },
  {
    path: '/app/teams/list',
    handler: () => {
      // Load teams list module
      import('../pages/teams/list.js')
        .then(module => module.default())
        .catch(error => console.error('Failed to load teams page:', error));
    },
    guard: GUARDS.AUTH,
    guardErrorHandler: authGuardHandler,
    title: 'Teams'
  },
  {
    path: '/app/teams/:id',
    handler: (params) => {
      // Load team details module with team ID
      import('../pages/teams/detail.js')
        .then(module => module.default(params))
        .catch(error => console.error('Failed to load team details page:', error));
    },
    guard: GUARDS.AUTH,
    guardErrorHandler: authGuardHandler,
    title: 'Team Details'
  },
  {
    path: '/app/profile/view',
    handler: () => {
      // Load profile view module
      import('../pages/profile/view.js')
        .then(module => module.default())
        .catch(error => console.error('Failed to load profile page:', error));
    },
    guard: GUARDS.AUTH,
    guardErrorHandler: authGuardHandler,
    title: 'Profile'
  },
  {
    path: '/app/profile/settings',
    handler: () => {
      // Load settings module
      import('../pages/profile/settings.js')
        .then(module => module.default())
        .catch(error => console.error('Failed to load settings page:', error));
    },
    guard: GUARDS.AUTH,
    guardErrorHandler: authGuardHandler,
    title: 'Settings'
  },
  
  // System pages
  {
    path: '/system/404',
    handler: () => {
      // Load 404 page module
      import('../pages/system/404.js')
        .then(module => module.default())
        .catch(error => console.error('Failed to load 404 page:', error));
    },
    title: 'Page Not Found'
  },
  {
    path: '/system/offline',
    handler: () => {
      // Load offline page module
      import('../pages/system/offline.js')
        .then(module => module.default())
        .catch(error => console.error('Failed to load offline page:', error));
    },
    title: 'You Are Offline'
  }
];

// Register routes
router.registerRoutes(routes);

export default router;
export { GUARDS, ROUTE_CHANGE_EVENT };