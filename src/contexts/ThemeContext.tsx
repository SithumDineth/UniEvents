import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { DARK, LIGHT, Theme } from '../constants/Themes';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [theme, setThemeState] = useState<Theme>(DARK as Theme);

  useEffect(() => {
    // Load saved theme on mount
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('themeMode') as ThemeMode | null;
        if (savedMode) {
          setMode(savedMode);
          setThemeState(savedMode === 'dark' ? DARK : LIGHT);
        }
      } catch (e) {
        console.error('Failed to load theme:', e);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', newMode);
      setMode(newMode);
      setThemeState(newMode === 'dark' ? DARK : LIGHT);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  };

  const toggleTheme = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setTheme(newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
