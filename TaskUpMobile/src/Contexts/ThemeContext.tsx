import React, { createContext, useContext } from 'react';
import { Theme } from '../Theme/Theme';

interface ThemeContextType {
  isDarkMode: boolean;
  theme: Theme;
  toggleTheme: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  theme: {} as Theme,
  toggleTheme: async () => {},
});

export const useTheme = () => useContext(ThemeContext);