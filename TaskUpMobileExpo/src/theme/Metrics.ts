
/**
 * App-wide metrics for consistent sizing of UI elements
 */
const Metrics = {
  // Header heights
  headerHeight: 56,
  largeHeaderHeight: 88,
  
  // Tab bar
  tabBarHeight: 64,
  tabBarIconSize: 24,
  
  // Inputs and controls
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  inputHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  
  // Border radius
  borderRadius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  
  // Icons
  iconSize: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
  },
  
  // Avatar
  avatarSize: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
    '2xl': 96,
  },
  
  // Z-index
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
  
  // Animation durations (ms)
  animationDuration: {
    fastest: 100,
    fast: 200,
    normal: 300,
    slow: 400,
    slowest: 500,
  },
};

export default Metrics;