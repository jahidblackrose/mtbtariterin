import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'dark' | 'oasis' | 'bloom' | 'azure' | 'divine';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: ThemeName[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme configuration - can be passed via API
interface ThemeConfig {
  theme?: ThemeName;
  loginType?: 'mobile' | 'account';
}

export const parseThemeFromUrl = (): ThemeConfig => {
  if (typeof window === 'undefined') return { theme: 'dark' };
  
  const params = new URLSearchParams(window.location.search);
  const theme = params.get('theme')?.toLowerCase() as ThemeName | undefined;
  const loginType = params.get('loginType') as 'mobile' | 'account' | undefined;
  
  const validThemes: ThemeName[] = ['dark', 'oasis', 'bloom', 'azure', 'divine'];
  
  return {
    theme: theme && validThemes.includes(theme) ? theme : 'dark',
    loginType: loginType || 'account'
  };
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeName;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme 
}) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    // Priority: 1. URL param, 2. localStorage, 3. defaultTheme, 4. 'dark'
    const urlConfig = parseThemeFromUrl();
    if (urlConfig.theme && urlConfig.theme !== 'dark') {
      return urlConfig.theme;
    }
    
    const stored = localStorage.getItem('mtb-theme') as ThemeName | null;
    if (stored && ['dark', 'oasis', 'bloom', 'azure', 'divine'].includes(stored)) {
      return stored;
    }
    
    return defaultTheme || 'dark';
  });

  const availableThemes: ThemeName[] = ['dark', 'oasis', 'bloom', 'azure', 'divine'];

  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove('dark', 'theme-oasis', 'theme-bloom', 'theme-azure', 'theme-divine');
    
    // Apply new theme class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add(`theme-${theme}`);
    }
    
    // Persist to localStorage
    localStorage.setItem('mtb-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook to get login configuration from URL
export const useLoginConfig = () => {
  const [config, setConfig] = useState<ThemeConfig>({ theme: 'dark', loginType: 'account' });
  
  useEffect(() => {
    setConfig(parseThemeFromUrl());
  }, []);
  
  return config;
};
