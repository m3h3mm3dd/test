import React, { createContext, useContext } from 'react';
import { ReactNode } from 'react';

/**
 * Color scheme type: 'light' or 'dark'
 */
export type ColorScheme = 'light' | 'dark';

/**
 * Shape of the theme context value
 */
export interface ThemeContextType {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
  isDark: boolean;
}

/**
 * ThemeContext provides access to theme state and controls
 */
export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

/**
 * Hook to consume the ThemeContext
 * Must be used within a ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Hook to get the current color scheme: 'light' or 'dark'
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
 * Hook to toggle between light and dark modes
 */
export const useToggleColorScheme = (): (() => void) => {
  const { toggleColorScheme } = useTheme();
  return toggleColorScheme;
};
