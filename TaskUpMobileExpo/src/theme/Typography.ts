/**
 * Typography styles for consistent text across the app
 */
const Typography = {
  // Font families
  fontFamily: {
    base: 'System',
    heading: 'System',
    mono: 'System-Mono',
  },
  
  // Font sizes for different purposes
  sizes: {
    // Basic sizes (in pixels)
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    
    // Semantic aliases
    caption: 12,
    bodySmall: 14,
    body: 16,
    bodyLarge: 18,
    title: 24,
    titleLarge: 30,
    heading: 36,
    displaySmall: 48,
    display: 60,
  },
  
  // Font weights
  weights: {
    thin: '100',
    extralight: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Line heights for different sizes
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
    
    // Specific line heights for common text elements
    body: 1.5,
    heading: 1.2,
  },
  
  // Letter spacing options
  letterSpacings: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },
  
  // Predefined text styles
  variants: {
    h1: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 30,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.35,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.4,
    },
    button: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 1.5,
      letterSpacing: 0.025,
    },
    overline: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 1.4,
      letterSpacing: 0.05,
      textTransform: 'uppercase',
    },
  },
};

export default Typography;