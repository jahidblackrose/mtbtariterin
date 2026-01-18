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
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);

  const rawTheme = params.get('theme');
  const theme = rawTheme ? (rawTheme.toLowerCase() as ThemeName) : undefined;

  // Accept both loginType and logintype (case-insensitive key support)
  const rawLoginType = (params.get('loginType') ?? params.get('logintype') ?? '').toLowerCase();
  const loginTypeParam = rawLoginType === 'mobile' || rawLoginType === 'account' ? (rawLoginType as 'mobile' | 'account') : undefined;

  const validThemes: ThemeName[] = ['dark', 'oasis', 'bloom', 'azure', 'divine'];

  return {
    // Only set theme if explicitly passed and valid
    theme: theme && validThemes.includes(theme) ? theme : undefined,
    // Only set loginType if explicitly passed, otherwise undefined (show both tabs)
    loginType: loginTypeParam,
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
    // Priority: 1. URL param (if explicitly passed), 2. localStorage, 3. defaultTheme, 4. 'dark'
    const urlConfig = parseThemeFromUrl();
    if (urlConfig.theme) {
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
  // IMPORTANT: initialize from URL immediately (avoids first-render mismatch on Login screen)
  const [config, setConfig] = useState<ThemeConfig>(() => parseThemeFromUrl());

  useEffect(() => {
    setConfig(parseThemeFromUrl());
  }, []);

  return config;
};
