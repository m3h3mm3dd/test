import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useDeviceColorScheme, ColorSchemeName, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

// Import theme elements
import Colors from './Colors';
import Typography from './Typography';
import Spacing from './Spacing';
import Metrics from './Metrics';
import { Storage } from '../constants';
import { triggerImpact } from '../utils/HapticUtils';

// Theme interface definitions
export type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  colors: Record<string, any>;
  typography: typeof Typography;
  spacing: typeof Spacing;
  metrics: typeof Metrics;
  isDark: boolean;
}

// Context for theme values
export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

// Props for Theme Provider
interface ThemeProviderProps {
  children: ReactNode;
  initialColorScheme?: ColorScheme;
  disableColorSchemeChange?: boolean;
}

/**
 * ThemeProvider - Provides theme context for app-wide theming
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
  
  // Theme loading state
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  
  // Load saved theme on startup
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(Storage.THEME);
        if (savedTheme) {
          setColorScheme(savedTheme as ColorScheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsThemeLoaded(true);
      }
    };
    
    loadSavedTheme();
  }, []);
  
  // Update scheme if device preference changes and not locked
  useEffect(() => {
    if (!initialColorScheme && !disableColorSchemeChange && deviceColorScheme && isThemeLoaded) {
      setColorScheme(deviceColorScheme as ColorScheme);
    }
  }, [deviceColorScheme, initialColorScheme, disableColorSchemeChange, isThemeLoaded]);
  
  // Save color scheme to storage when it changes
  useEffect(() => {
    if (isThemeLoaded) {
      AsyncStorage.setItem(Storage.THEME, colorScheme).catch(error => {
        console.error('Error saving theme preference:', error);
      });
    }
  }, [colorScheme, isThemeLoaded]);
  
  // Update status bar based on theme
  useEffect(() => {
    if (isThemeLoaded) {
      StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
      
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent');
        StatusBar.setTranslucent(true);
      }
    }
  }, [colorScheme, isThemeLoaded]);
  
  // Toggle between light and dark mode
  const toggleColorScheme = () => {
    if (!disableColorSchemeChange) {
      const newScheme = colorScheme === 'light' ? 'dark' : 'light';
      setColorScheme(newScheme);
      
      // Provide haptic feedback when changing theme
      triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  // Convenience boolean for dark mode
  const isDark = colorScheme === 'dark';
  
  // Get theme-specific color values
  const getThemeColors = () => {
    // Base colors remain the same
    const baseColors = {
      primary: Colors.primary,
      secondary: Colors.secondary,
      success: Colors.success,
      error: Colors.error,
      warning: Colors.warning,
      neutrals: Colors.neutrals,
    };
    
    // Theme-specific variations
    const themeSpecificColors = {
      background: isDark ? {
        light: Colors.neutrals[900],
        dark: Colors.neutrals[950],
        paper: Colors.neutrals[800],
        subtle: Colors.neutrals[850]
      } : Colors.background,
      
      text: {
        primary: isDark ? Colors.neutrals[100] : Colors.neutrals[900],
        secondary: isDark ? Colors.neutrals[300] : Colors.neutrals[600],
        disabled: isDark ? Colors.neutrals[600] : Colors.neutrals[400],
        light: Colors.neutrals.white,
      },
      
      border: isDark ? Colors.neutrals[700] : Colors.neutrals[200],
      divider: isDark ? `rgba(255, 255, 255, 0.1)` : `rgba(0, 0, 0, 0.1)`,
      
      status: Colors.status,
      gradient: Colors.gradient,
      
      // Component specific colors
      card: {
        background: isDark ? Colors.neutrals[800] : Colors.neutrals.white,
        border: isDark ? Colors.neutrals[700] : Colors.neutrals[200]
      },
      
      input: {
        background: isDark ? Colors.neutrals[800] : Colors.neutrals.white,
        border: isDark ? Colors.neutrals[700] : Colors.neutrals[300],
        placeholderText: isDark ? Colors.neutrals[600] : Colors.neutrals[400]
      }
    };
    
    return {
      ...baseColors,
      ...themeSpecificColors
    };
  };
  
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
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access the theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Hook to get the current color scheme
 */
export const useColorScheme = (): ColorScheme => {
  const { colorScheme } = useTheme();
  return colorScheme;
};

/**
 * Hook to check if dark mode is active
 */
export const useIsDarkMode = (): boolean => {
  const { isDark } = useTheme();
  return isDark;
};

/**
 * Hook to toggle color scheme
 */
export const useToggleColorScheme = (): (() => void) => {
  const { toggleColorScheme } = useTheme();
  return toggleColorScheme;
};