import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

// WCAG-compliant color systems
const colorSystems = {
  dark: {
    background: '#0A0A0E',
    surface: '#15151E',
    card: '#1C1C28',
    border: 'rgba(255, 255, 255, 0.05)',
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      muted: 'rgba(255, 255, 255, 0.5)',
      subtle: 'rgba(255, 255, 255, 0.3)'
    }
  },
  light: {
    background: '#FAFAFA',
    surface: '#EEEEF0',
    card: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.08)',
    text: {
      primary: '#1A1A2E',
      secondary: 'rgba(26, 26, 46, 0.7)',
      muted: 'rgba(26, 26, 46, 0.6)',
      subtle: 'rgba(26, 26, 46, 0.4)'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const getPreferredTheme = () => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('f1-theme');
      if (saved) return saved;

      // Then check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'dark'; // default
  };

  const [theme, setTheme] = useState(getPreferredTheme);
  const [systemPreference, setSystemPreference] = useState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    const colors = colorSystems[theme];

    // Set theme class
    root.classList.remove('dark', 'light');
    root.classList.add(theme);

    // Apply CSS custom properties for contrast-optimized colors
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-card', colors.card);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-text-primary', colors.text.primary);
    root.style.setProperty('--color-text-secondary', colors.text.secondary);
    root.style.setProperty('--color-text-muted', colors.text.muted);
    root.style.setProperty('--color-text-subtle', colors.text.subtle);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colors.background);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = colors.background;
      document.head.appendChild(meta);
    }

    localStorage.setItem('f1-theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('f1-theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Safari fallback
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setThemePreference = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('f1-theme', newTheme);
  };

  // Check if we're following system preference
  const followingSystem = !localStorage.getItem('f1-theme');

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setThemePreference,
      systemPreference,
      followingSystem,
      colors: colorSystems[theme]
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
