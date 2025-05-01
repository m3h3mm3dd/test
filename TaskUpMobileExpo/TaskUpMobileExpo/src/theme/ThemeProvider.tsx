
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useDeviceColorScheme, ColorSchemeName, StatusBar } from 'react-native';
import { NativeBaseProvider, extendTheme, StorageManager, ColorMode } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Storage } from '@/constants';

// Import theme elements
import Colors from './Colors';
import Typography from './Typography';
import Spacing from './Spacing';
import Metrics from './Metrics';

// Theme interface definitions
export type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  colors: typeof Colors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  metrics: typeof Metrics;
  isDark: boolean;
}

// Context for theme values
const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

// Props for Theme Provider
interface ThemeProviderProps {
  children: ReactNode;
  initialColorScheme?: ColorScheme;
  disableColorSchemeChange?: boolean;
}

// Setup Native Base color mode persistence
const colorModeManager: StorageManager = {
  get: async () => {
    try {
      let val = await AsyncStorage.getItem(Storage.THEME);
      return val === 'dark' ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  },
  set: async (value: ColorMode) => {
    try {
      await AsyncStorage.setItem(Storage.THEME, value);
    } catch (e) {
      console.error('Error setting color mode to async storage:', e);
    }
  },
};

/**
 * ThemeProvider - Provides theme context and NativeBase provider
 * Use this at the root of your application to enable theming
 */
export const ThemeProvider = ({ 
  children, 
  initialColorScheme,
  disableColorSchemeChange = false
}: ThemeProviderProps) => {
  // Get device color scheme
  const deviceColorScheme = useDeviceColorScheme() as ColorSchemeName;
  
  // State for current color scheme
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    initialColorScheme || (deviceColorScheme as ColorScheme) || 'light'
  );
  
  // Update scheme if device preference changes and not locked
  useEffect(() => {
    if (!initialColorScheme && !disableColorSchemeChange && deviceColorScheme) {
      setColorScheme(deviceColorScheme as ColorScheme);
    }
  }, [deviceColorScheme, initialColorScheme, disableColorSchemeChange]);
  
  // Save color scheme to storage when it changes
  useEffect(() => {
    AsyncStorage.setItem(Storage.THEME, colorScheme).catch(error => {
      console.error('Error saving theme preference:', error);
    });
  }, [colorScheme]);
  
  // Toggle between light and dark mode
  const toggleColorScheme = () => {
    if (!disableColorSchemeChange) {
      setColorScheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  };
  
  // Convenience boolean for dark mode
  const isDark = colorScheme === 'dark';
  
  // Get theme-specific color values
  const getThemeColors = () => {
    const themeSpecificColors = {
      background: isDark ? Colors.background.dark : Colors.background.light,
      text: isDark ? Colors.neutrals[100] : Colors.neutrals[900],
      textSecondary: isDark ? Colors.neutrals[300] : Colors.neutrals[600],
      surface: isDark ? '#1E1E1E' : Colors.background.paper,
      border: isDark ? Colors.neutrals[700] : Colors.neutrals[200],
      shadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)',
    };
    
    return {
      ...Colors,
      themed: themeSpecificColors,
    };
  };
  
  // Extend the NativeBase theme with our custom values
  const nbTheme = extendTheme({
    // Colors with light/dark variations
    colors: {
      // Primary colors
      primary: {
        50: Colors.primary[50],
        100: Colors.primary[100],
        200: Colors.primary[200],
        300: Colors.primary[300],
        400: Colors.primary[400],
        500: Colors.primary[500],
        600: Colors.primary[600],
        700: Colors.primary[700],
        800: Colors.primary[800],
        900: Colors.primary[900],
      },
      // Secondary colors
      secondary: {
        50: Colors.secondary[50],
        100: Colors.secondary[100],
        200: Colors.secondary[200],
        300: Colors.secondary[300],
        400: Colors.secondary[400],
        500: Colors.secondary[500],
        600: Colors.secondary[600],
        700: Colors.secondary[700],
        800: Colors.secondary[800],
        900: Colors.secondary[900],
      },
      // Success colors
      success: {
        50: Colors.success[50],
        100: Colors.success[100],
        200: Colors.success[200],
        300: Colors.success[300],
        400: Colors.success[400],
        500: Colors.success[500],
        600: Colors.success[600],
        700: Colors.success[700],
        800: Colors.success[800],
        900: Colors.success[900],
      },
      // Error colors
      error: {
        50: Colors.error[50],
        100: Colors.error[100],
        200: Colors.error[200],
        300: Colors.error[300],
        400: Colors.error[400],
        500: Colors.error[500],
        600: Colors.error[600],
        700: Colors.error[700],
        800: Colors.error[800],
        900: Colors.error[900],
      },
      // Warning colors
      warning: {
        50: Colors.warning[50],
        100: Colors.warning[100],
        200: Colors.warning[200],
        300: Colors.warning[300],
        400: Colors.warning[400],
        500: Colors.warning[500],
        600: Colors.warning[600],
        700: Colors.warning[700],
        800: Colors.warning[800],
        900: Colors.warning[900],
      },
      // Neutral/gray scale
      gray: {
        50: Colors.neutrals[50],
        100: Colors.neutrals[100],
        200: Colors.neutrals[200],
        300: Colors.neutrals[300],
        400: Colors.neutrals[400],
        500: Colors.neutrals[500],
        600: Colors.neutrals[600],
        700: Colors.neutrals[700],
        800: Colors.neutrals[800],
        900: Colors.neutrals[900],
      },
      // Light and dark specific colors
      light: {
        background: Colors.background.light,
        surface: Colors.background.paper,
        text: Colors.neutrals[900],
        textSecondary: Colors.neutrals[600],
        border: Colors.neutrals[200],
      },
      dark: {
        background: Colors.background.dark,
        surface: '#1E1E1E',
        text: Colors.neutrals[100],
        textSecondary: Colors.neutrals[300],
        border: Colors.neutrals[700],
      },
    },
    
    // Font configuration
    fontConfig: {
      // Define custom fonts if needed
      Inter: {
        100: {
          normal: 'Inter-Thin',
        },
        200: {
          normal: 'Inter-ExtraLight',
        },
        300: {
          normal: 'Inter-Light',
        },
        400: {
          normal: 'Inter-Regular',
        },
        500: {
          normal: 'Inter-Medium',
        },
        600: {
          normal: 'Inter-SemiBold',
        },
        700: {
          normal: 'Inter-Bold',
        },
        800: {
          normal: 'Inter-ExtraBold',
        },
        900: {
          normal: 'Inter-Black',
        },
      },
    },
    
    // Default fonts (fallback to system if custom not available)
    fonts: {
      heading: 'Inter, System',
      body: 'Inter, System',
      mono: 'System-Mono',
    },
    
    // Font sizes
    fontSizes: {
      '2xs': 10,
      'xs': Typography.sizes.xs, // 12
      'sm': Typography.sizes.sm, // 14
      'md': Typography.sizes.md, // 16
      'lg': Typography.sizes.lg, // 18
      'xl': Typography.sizes.xl, // 20
      '2xl': Typography.sizes['2xl'], // 24
      '3xl': Typography.sizes['3xl'], // 30
      '4xl': Typography.sizes['4xl'], // 36
      '5xl': Typography.sizes['5xl'], // 48
      '6xl': Typography.sizes['6xl'], // 60
    },
    
    // Font weights
    fontWeights: {
      hairline: Typography.weights.thin,
      thin: Typography.weights.extralight,
      light: Typography.weights.light,
      normal: Typography.weights.regular,
      medium: Typography.weights.medium,
      semibold: Typography.weights.semibold,
      bold: Typography.weights.bold,
      extrabold: Typography.weights.extrabold,
      black: Typography.weights.black,
    },
    
    // Letter spacings
    letterSpacings: {
      tighter: Typography.letterSpacings.tighter,
      tight: Typography.letterSpacings.tight,
      normal: Typography.letterSpacings.normal,
      wide: Typography.letterSpacings.wide,
      wider: Typography.letterSpacings.wider,
      widest: Typography.letterSpacings.widest,
    },
    
    // Line heights
    lineHeights: {
      none: Typography.lineHeights.none,
      tight: Typography.lineHeights.tight,
      snug: Typography.lineHeights.snug,
      normal: Typography.lineHeights.normal,
      relaxed: Typography.lineHeights.relaxed,
      loose: Typography.lineHeights.loose,
    },
    
    // Spacing values
    space: {
      px: 1,
      0.5: Spacing[0.5],
      1: Spacing[1],
      1.5: Spacing[1.5],
      2: Spacing[2],
      2.5: Spacing[2.5],
      3: Spacing[3],
      3.5: Spacing[3.5],
      4: Spacing[4],
      5: Spacing[5],
      6: Spacing[6],
      7: Spacing[7],
      8: Spacing[8],
      9: Spacing[9],
      10: Spacing[10],
      12: Spacing[12],
      16: Spacing[16],
      20: Spacing[20],
      24: Spacing[24],
      32: Spacing[32],
      40: Spacing[40],
      48: Spacing[48],
      56: Spacing[56],
      64: Spacing[64],
      72: Spacing[72],
      80: Spacing[80],
      96: Spacing[96],
    },
    
    // Border radii
    radii: {
      none: Metrics.borderRadius.none,
      xs: Metrics.borderRadius.xs,
      sm: Metrics.borderRadius.sm,
      md: Metrics.borderRadius.md,
      lg: Metrics.borderRadius.lg,
      xl: Metrics.borderRadius.xl,
      '2xl': Metrics.borderRadius['2xl'],
      full: Metrics.borderRadius.full,
    },
    
    // Component specific styling
    components: {
      // Button customization
      Button: {
        baseStyle: {
          borderRadius: 'md',
          _text: {
            fontWeight: 'semibold',
          },
        },
        defaultProps: {
          colorScheme: 'primary',
          size: 'md',
        },
        sizes: {
          xs: {
            px: 3,
            py: 1,
            _text: {
              fontSize: 'xs',
            },
          },
          sm: {
            px: 4,
            py: 2,
            _text: {
              fontSize: 'sm',
            },
          },
          md: {
            px: 5,
            py: 2.5,
            _text: {
              fontSize: 'md',
            },
          },
          lg: {
            px: 6,
            py: 3,
            _text: {
              fontSize: 'lg',
            },
          },
        },
      },
      
      // Input customization
      Input: {
        baseStyle: {
          borderRadius: 'md',
          borderWidth: 1,
          _focus: {
            borderColor: 'primary.500',
          },
        },
        defaultProps: {
          size: 'md',
        },
      },
      
      // Text customization
      Text: {
        baseStyle: {
          color: isDark ? 'light.text' : 'dark.text',
        },
        variants: {
          heading1: {
            fontSize: '4xl',
            fontWeight: 'bold',
            lineHeight: 'tight',
          },
          heading2: {
            fontSize: '3xl',
            fontWeight: 'bold',
            lineHeight: 'tight',
          },
          heading3: {
            fontSize: '2xl',
            fontWeight: 'bold',
            lineHeight: 'tight',
          },
          heading4: {
            fontSize: 'xl',
            fontWeight: 'semibold',
            lineHeight: 'tight',
          },
          heading5: {
            fontSize: 'lg',
            fontWeight: 'semibold',
            lineHeight: 'tight',
          },
          heading6: {
            fontSize: 'md',
            fontWeight: 'semibold',
            lineHeight: 'tight',
          },
          body1: {
            fontSize: 'md',
            lineHeight: 'relaxed',
          },
          body2: {
            fontSize: 'sm',
            lineHeight: 'relaxed',
          },
          caption: {
            fontSize: 'xs',
            lineHeight: 'normal',
          },
          overline: {
            fontSize: 'xs',
            fontWeight: 'medium',
            letterSpacing: 'wider',
            textTransform: 'uppercase',
          },
        },
      },
      
      // Card customization
      Box: {
        variants: {
          card: {
            bg: isDark ? 'dark.surface' : 'light.surface',
            borderRadius: 'lg',
            padding: 4,
            shadow: 2,
          },
        },
      },
    },
    
    // NativeBase specific config
    config: {
      useSystemColorMode: false,
      initialColorMode: colorScheme,
      disableTransitionOnColorModeChange: true,
    },
  });
  
  // Create the theme context value
  const themeContextValue: ThemeContextType = {
    colorScheme,
    toggleColorScheme,
    setColorScheme,
    colors: getThemeColors(),
    typography: Typography,
    spacing: Spacing,
    metrics: Metrics,
    isDark,
  };
  
  return (
    <ThemeContext.Provider value={themeContextValue}>
      <NativeBaseProvider theme={nbTheme} colorModeManager={colorModeManager}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? Colors.background.dark : Colors.background.light}
          translucent
        />
        {children}
      </NativeBaseProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access the theme context
 * Use this to get colors, typography, spacing, and theme functions
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Standalone hook to just get color scheme
 */
export const useColorScheme = (): ColorScheme => {
  const { colorScheme } = useTheme();
  return colorScheme;
};

/**
 * Standalone hook to check if dark mode is active
 */
export const useIsDarkMode = (): boolean => {
  const { isDark } = useTheme();
  return isDark;
};

/**
 * Standalone hook to toggle color scheme
 */
export const useToggleColorScheme = (): (() => void) => {
  const { toggleColorScheme } = useTheme();
  return toggleColorScheme;
};