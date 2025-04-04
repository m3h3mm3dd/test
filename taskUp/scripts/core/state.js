/**
 * State Management for TaskUp
 * 
 * A lightweight state management system inspired by Redux
 * but simplified for smaller applications
 */

// Action types
export const ActionTypes = {
    // App state
    APP_INIT: 'APP_INIT',
    APP_LOADING: 'APP_LOADING',
    APP_ERROR: 'APP_ERROR',
    APP_THEME_CHANGE: 'APP_THEME_CHANGE',
    
    // User related
    USER_LOGIN: 'USER_LOGIN',
    USER_LOGOUT: 'USER_LOGOUT',
    USER_UPDATE: 'USER_UPDATE',
    
    // Projects
    PROJECTS_FETCH: 'PROJECTS_FETCH',
    PROJECT_SELECT: 'PROJECT_SELECT',
    PROJECT_ADD: 'PROJECT_ADD',
    PROJECT_UPDATE: 'PROJECT_UPDATE',
    PROJECT_DELETE: 'PROJECT_DELETE',
    
    // Tasks
    TASKS_FETCH: 'TASKS_FETCH',
    TASK_SELECT: 'TASK_SELECT',
    TASK_ADD: 'TASK_ADD',
    TASK_UPDATE: 'TASK_UPDATE',
    TASK_DELETE: 'TASK_DELETE',
    TASK_MOVE: 'TASK_MOVE',
    
    // Teams
    TEAMS_FETCH: 'TEAMS_FETCH',
    TEAM_SELECT: 'TEAM_SELECT',
    TEAM_ADD: 'TEAM_ADD',
    TEAM_UPDATE: 'TEAM_UPDATE',
    TEAM_DELETE: 'TEAM_DELETE',
    
    // Notifications
    NOTIFICATIONS_FETCH: 'NOTIFICATIONS_FETCH',
    NOTIFICATION_ADD: 'NOTIFICATION_ADD',
    NOTIFICATION_READ: 'NOTIFICATION_READ',
    NOTIFICATIONS_CLEAR: 'NOTIFICATIONS_CLEAR',
    
    // UI state
    UI_SIDEBAR_TOGGLE: 'UI_SIDEBAR_TOGGLE',
    UI_MODAL_OPEN: 'UI_MODAL_OPEN',
    UI_MODAL_CLOSE: 'UI_MODAL_CLOSE',
    UI_VIEW_MODE_CHANGE: 'UI_VIEW_MODE_CHANGE',
    UI_FILTER_CHANGE: 'UI_FILTER_CHANGE',
    UI_SORT_CHANGE: 'UI_SORT_CHANGE'
  };
  
  /**
   * Initial application state
   */
  const initialState = {
    // App state
    app: {
      initialized: false,
      loading: false,
      error: null,
      theme: 'system', // 'light', 'dark', or 'system'
      version: '1.0.0'
    },
    
    // User state
    user: {
      isAuthenticated: false,
      data: null,
      preferences: {
        language: 'en',
        notifications: true,
        sidebar: true
      }
    },
    
    // Projects state
    projects: {
      data: [],
      currentProject: null,
      loading: false,
      error: null,
      filters: {
        status: 'all',
        team: null
      }
    },
    
    // Tasks state
    tasks: {
      data: [],
      currentTask: null,
      loading: false,
      error: null,
      filters: {
        status: 'all',
        priority: 'all',
        assignee: 'all',
        dueDate: 'all'
      },
      sort: {
        field: 'dueDate',
        direction: 'asc'
      },
      viewMode: 'list' // 'list', 'board', 'calendar'
    },
    
    // Teams state
    teams: {
      data: [],
      currentTeam: null,
      loading: false,
      error: null
    },
    
    // Notifications state
    notifications: {
      data: [],
      unreadCount: 0,
      loading: false,
      error: null
    },
    
    // UI state
    ui: {
      sidebarCollapsed: false,
      currentModal: null,
      modalData: null,
      isMobile: window.innerWidth < 768,
      isFocusMode: false,
      searchQuery: '',
      tour: {
        active: false,
        step: 0,
        completed: false
      },
      currentPage: 'dashboard'
    }
  };
  
  /**
   * Create a deep clone of an object
   * @param {Object} obj - Object to clone
   * @returns {Object} - Cloned object
   */
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  /**
   * State management class (Store)
   */
  class Store {
    constructor(initialState = {}) {
      this.state = deepClone(initialState);
      this.listeners = [];
      this.reducers = {};
      this.middlewares = [];
    }
    
    /**
     * Get the current state
     * @returns {Object} - Current state
     */
    getState() {
      return this.state;
    }
    
    /**
     * Replace the entire state
     * @param {Object} newState - New state to set
     * @private
     */
    setState(newState) {
      this.state = newState;
      this.notifyListeners();
    }
    
    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback for state changes
     * @returns {Function} - Unsubscribe function
     */
    subscribe(listener) {
      this.listeners.push(listener);
      
      // Return unsubscribe function
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }
    
    /**
     * Register a reducer for a specific state slice
     * @param {string} sliceName - State slice name
     * @param {Function} reducer - Reducer function
     */
    registerReducer(sliceName, reducer) {
      this.reducers[sliceName] = reducer;
    }
    
    /**
     * Add middleware to the store
     * @param {Function} middleware - Middleware function
     */
    addMiddleware(middleware) {
      this.middlewares.push(middleware);
    }
    
    /**
     * Dispatch an action to update state
     * @param {Object} action - Action object with type and payload
     * @returns {Object} - Action that was dispatched
     */
    dispatch(action) {
      // Run action through middlewares
      let processedAction = action;
      
      for (const middleware of this.middlewares) {
        processedAction = middleware(this.state, processedAction);
      }
      
      // Create a new state object
      const newState = deepClone(this.state);
      
      // Process action in each reducer
      Object.keys(this.reducers).forEach(sliceName => {
        if (newState[sliceName]) {
          newState[sliceName] = this.reducers[sliceName](
            newState[sliceName],
            processedAction
          );
        }
      });
      
      // Update state and notify listeners
      this.setState(newState);
      
      // Return the processed action
      return processedAction;
    }
    
    /**
     * Notify all listeners of state change
     * @private
     */
    notifyListeners() {
      this.listeners.forEach(listener => listener(this.state));
    }
    
    /**
     * Reset state to initial state
     */
    resetState() {
      this.setState(deepClone(initialState));
    }
  }
  
  // Create store instance
  const store = new Store(initialState);
  
  /**
   * App reducer
   */
  function appReducer(state, action) {
    switch (action.type) {
      case ActionTypes.APP_INIT:
        return {
          ...state,
          initialized: true,
          loading: false,
          error: null
        };
        
      case ActionTypes.APP_LOADING:
        return {
          ...state,
          loading: action.payload
        };
        
      case ActionTypes.APP_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false
        };
        
      case ActionTypes.APP_THEME_CHANGE:
        return {
          ...state,
          theme: action.payload
        };
        
      default:
        return state;
    }
  }
  
  /**
   * User reducer
   */
  function userReducer(state, action) {
    switch (action.type) {
      case ActionTypes.USER_LOGIN:
        return {
          ...state,
          isAuthenticated: true,
          data: action.payload
        };
        
      case ActionTypes.USER_LOGOUT:
        return {
          ...state,
          isAuthenticated: false,
          data: null
        };
        
      case ActionTypes.USER_UPDATE:
        return {
          ...state,
          data: {
            ...state.data,
            ...action.payload
          }
        };
        
      default:
        return state;
    }
  }
  
  /**
   * Projects reducer
   */
  function projectsReducer(state, action) {
    switch (action.type) {
      case ActionTypes.PROJECTS_FETCH:
        return {
          ...state,
          data: action.payload,
          loading: false,
          error: null
        };
        
      case ActionTypes.PROJECT_SELECT:
        return {
          ...state,
          currentProject: action.payload
        };
        
      case ActionTypes.PROJECT_ADD:
        return {
          ...state,
          data: [...state.data, action.payload]
        };
        
      case ActionTypes.PROJECT_UPDATE:
        return {
          ...state,
          data: state.data.map(project => 
            project.id === action.payload.id 
              ? { ...project, ...action.payload } 
              : project
          ),
          currentProject: state.currentProject && state.currentProject.id === action.payload.id
            ? { ...state.currentProject, ...action.payload }
            : state.currentProject
        };
        
      case ActionTypes.PROJECT_DELETE:
        return {
          ...state,
          data: state.data.filter(project => project.id !== action.payload),
          currentProject: state.currentProject && state.currentProject.id === action.payload
            ? null
            : state.currentProject
        };
        
      default:
        return state;
    }
  }
  
  /**
   * Tasks reducer
   */
  function tasksReducer(state, action) {
    switch (action.type) {
      case ActionTypes.TASKS_FETCH:
        return {
          ...state,
          data: action.payload,
          loading: false,
          error: null
        };
        
      case ActionTypes.TASK_SELECT:
        return {
          ...state,
          currentTask: action.payload
        };
        
      case ActionTypes.TASK_ADD:
        return {
          ...state,
          data: [...state.data, action.payload]
        };
        
      case ActionTypes.TASK_UPDATE:
        return {
          ...state,
          data: state.data.map(task => 
            task.id === action.payload.id 
              ? { ...task, ...action.payload } 
              : task
          ),
          currentTask: state.currentTask && state.currentTask.id === action.payload.id
            ? { ...state.currentTask, ...action.payload }
            : state.currentTask
        };
        
      case ActionTypes.TASK_DELETE:
        return {
          ...state,
          data: state.data.filter(task => task.id !== action.payload),
          currentTask: state.currentTask && state.currentTask.id === action.payload
            ? null
            : state.currentTask
        };
        
      case ActionTypes.TASK_MOVE:
        const { taskId, status, position } = action.payload;
        const task = state.data.find(t => t.id === taskId);
        
        if (!task) return state;
        
        // Remove task from current position
        const filteredTasks = state.data.filter(t => t.id !== taskId);
        
        // Update task status
        const updatedTask = { ...task, status };
        
        // Insert task at new position
        const newTasks = [...filteredTasks];
        const tasksWithStatus = newTasks.filter(t => t.status === status);
        
        if (position >= 0 && position <= tasksWithStatus.length) {
          const insertIndex = newTasks.indexOf(tasksWithStatus[0]) + position;
          newTasks.splice(insertIndex, 0, updatedTask);
        } else {
          newTasks.push(updatedTask);
        }
        
        return {
          ...state,
          data: newTasks,
          currentTask: state.currentTask && state.currentTask.id === taskId
            ? updatedTask
            : state.currentTask
        };
        
      case ActionTypes.UI_VIEW_MODE_CHANGE:
        return {
          ...state,
          viewMode: action.payload
        };
        
      case ActionTypes.UI_FILTER_CHANGE:
        return {
          ...state,
          filters: {
            ...state.filters,
            ...action.payload
          }
        };
        
      case ActionTypes.UI_SORT_CHANGE:
        return {
          ...state,
          sort: action.payload
        };
        
      default:
        return state;
    }
  }
  
  /**
   * Teams reducer
   */
  function teamsReducer(state, action) {
    switch (action.type) {
      case ActionTypes.TEAMS_FETCH:
        return {
          ...state,
          data: action.payload,
          loading: false,
          error: null
        };
        
      case ActionTypes.TEAM_SELECT:
        return {
          ...state,
          currentTeam: action.payload
        };
        
      case ActionTypes.TEAM_ADD:
        return {
          ...state,
          data: [...state.data, action.payload]
        };
        
      case ActionTypes.TEAM_UPDATE:
        return {
          ...state,
          data: state.data.map(team => 
            team.id === action.payload.id 
              ? { ...team, ...action.payload } 
              : team
          ),
          currentTeam: state.currentTeam && state.currentTeam.id === action.payload.id
            ? { ...state.currentTeam, ...action.payload }
            : state.currentTeam
        };
        
      case ActionTypes.TEAM_DELETE:
        return {
          ...state,
          data: state.data.filter(team => team.id !== action.payload),
          currentTeam: state.currentTeam && state.currentTeam.id === action.payload
            ? null
            : state.currentTeam
        };
        
      default:
        return state;
    }
  }
  
  /**
   * Notifications reducer
   */
  function notificationsReducer(state, action) {
    switch (action.type) {
      case ActionTypes.NOTIFICATIONS_FETCH:
        return {
          ...state,
          data: action.payload,
          unreadCount: action.payload.filter(n => !n.read).length,
          loading: false,
          error: null
        };
        
      case ActionTypes.NOTIFICATION_ADD:
        return {
          ...state,
          data: [action.payload, ...state.data],
          unreadCount: state.unreadCount + (action.payload.read ? 0 : 1)
        };
        
      case ActionTypes.NOTIFICATION_READ:
        return {
          ...state,
          data: state.data.map(notification => 
            notification.id === action.payload 
              ? { ...notification, read: true } 
              : notification
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        };
        
      case ActionTypes.NOTIFICATIONS_CLEAR:
        return {
          ...state,
          data: state.data.map(notification => ({ ...notification, read: true })),
          unreadCount: 0
        };
        
      default:
        return state;
    }
  }
  
  /**
   * UI reducer
   */
  function uiReducer(state, action) {
    switch (action.type) {
      case ActionTypes.UI_SIDEBAR_TOGGLE:
        return {
          ...state,
          sidebarCollapsed: action.payload !== undefined ? action.payload : !state.sidebarCollapsed
        };
        
      case ActionTypes.UI_MODAL_OPEN:
        return {
          ...state,
          currentModal: action.payload.modal,
          modalData: action.payload.data || null
        };
        
      case ActionTypes.UI_MODAL_CLOSE:
        return {
          ...state,
          currentModal: null,
          modalData: null
        };
        
      default:
        return state;
    }
  }
  
  // Register reducers
  store.registerReducer('app', appReducer);
  store.registerReducer('user', userReducer);
  store.registerReducer('projects', projectsReducer);
  store.registerReducer('tasks', tasksReducer);
  store.registerReducer('teams', teamsReducer);
  store.registerReducer('notifications', notificationsReducer);
  store.registerReducer('ui', uiReducer);
  
  // Example middleware - logging
  const loggingMiddleware = (state, action) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Action:', action.type, action.payload);
    }
    return action;
  };
  
  // Add middlewares
  store.addMiddleware(loggingMiddleware);
  
  export default store;