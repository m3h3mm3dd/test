/**
 * App-wide metrics for consistent sizing of UI elements
 */
const Metrics = {
  // Default button heights
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  
  // Default input field heights
  inputHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  
  // Fixed header heights
  headerHeight: {
    sm: 48,
    md: 56,
    lg: 64,
    xl: 80,
  },
  
  // Navigation & tab bars
  tabBarHeight: 64,
  bottomTabBarHeight: 83, // including safe area on devices with home indicator
  
  // Border radius values
  borderRadius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },
  
  // Avatar and icon sizes
  iconSize: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
  },
  
  avatarSize: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
    '2xl': 96,
  },
  
  // Modal metrics
  modal: {
    borderRadius: 24,
    width: {
      sm: 0.6, // percentage of screen width
      md: 0.8,
      lg: 0.9,
      full: 1,
    },
  },
  
  // Card dimensions
  card: {
    minHeight: 100,
    borderRadius: 12,
    elevation: 2,
  },
  
  // Animation durations (ms)
  animation: {
    veryFast: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  
  // Touch targets (minimum size for touchable elements)
  touchTarget: {
    min: 44, // Apple's HIG recommendation
    default: 48, // Material Design recommendation
  },
  
  // Screen dimensions
  screen: {
    xs: 360,  // small phones
    sm: 390,  // standard phones
    md: 768,  // large phones
    lg: 1024, // tablets
    xl: 1280, // large tablets
  },
  
  // Z-index values
  zIndex: {
    base: 0,
    dialog: 5,
    drawer: 10,
    modal: 15,
    overlay: 20,
    toast: 25,
    popup: 30,
  },
  
  // Shadows
  shadow: {
    sm: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 3,
    },
    lg: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
    xl: {
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 12,
    },
  },
};

export default Metrics;