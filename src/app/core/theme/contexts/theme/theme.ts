import { createContext } from 'react';

export interface ThemeState {
  isDarkThemeActive: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeState | undefined>(undefined);
