
import { useContext } from 'react';
import { ThemeContext, ColorScheme } from '@/theme/ThemeProvider';

/**
 * Hook to get the current color scheme ('light' | 'dark').
 */
export function useColorScheme(): ColorScheme {
  const { colorScheme } = useContext(ThemeContext);
  return colorScheme;
}

/**
 * Hook to toggle between light and dark mode
 */
export function useColorSchemeToggle(): () => void {
  const { toggleColorScheme } = useContext(ThemeContext);
  return toggleColorScheme;
}

/**
 * Hook to set a specific color scheme
 */
export function useSetColorScheme(): (scheme: ColorScheme) => void {
  const { setColorScheme } = useContext(ThemeContext);
  return setColorScheme;
}

/**
 * Hook to determine if current theme is dark mode
 */
export function useIsDarkMode(): boolean {
  const { isDark } = useContext(ThemeContext);
  return isDark;
}

export { useTheme } from '@/theme/ThemeProvider';