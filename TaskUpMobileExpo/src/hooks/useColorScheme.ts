/* src/components/useColorScheme.ts */
import { useColorScheme as _useColorScheme } from 'react-native';
import { Colors } from '@/theme/Colors';
import { Metrics } from '@/theme/Metrics';
import { Spacing } from '@/theme/Spacing';
import { Typography } from '@/theme/Typography';

/**
 * Supported color scheme types
 */
export type ColorScheme = 'light' | 'dark';

/**
 * Hook to get the current system color scheme ('light' | 'dark').
 */
export function useColorScheme(): ColorScheme {
  const scheme = _useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

/**
 * Hook to retrieve theme values: colors, metrics, spacing, and typography tailored to the active color scheme.
 */
export function useTheme() {
  const scheme = useColorScheme();

  const themeColors = {
    primary: Colors.primary.blue,
    darkPrimary: Colors.primary.darkBlue,
    tint: Colors.tint,
    tabIconDefault: Colors.tabIconDefault,
    tabIconSelected: Colors.tabIconSelected,
    background: scheme === 'dark'
      ? Colors.background.dark
      : Colors.background.light,
  };

  return {
    colors: themeColors,
    metrics: Metrics,
    spacing: Spacing,
    typography: Typography,
  };
}
