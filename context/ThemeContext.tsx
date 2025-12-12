import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeId = 'default' | 'neon' | 'ocean' | 'sunset';

interface ThemeColor {
  primary: Record<number, string>;
  secondary: Record<number, string>;
  base: Record<number, string>;
}

export const themes: Record<ThemeId, { name: string; colors: ThemeColor; preview: string }> = {
  default: {
    name: '默认 (粉色)',
    preview: 'bg-pink-500',
    colors: {
      primary: { 500: '236 72 153', 400: '244 114 182', 300: '249 168 212' }, // Pink
      secondary: { 500: '225 29 72', 400: '244 63 94' }, // Rose
      base: {
        900: '15 23 42', 800: '30 41 59', 700: '51 65 85',
        600: '71 85 105', 500: '100 116 139', 400: '148 163 184',
        300: '203 213 225', 200: '226 232 240', 100: '241 245 249'
      }
    }
  },
  neon: {
    name: '霓虹 (Neon)',
    preview: 'bg-violet-500',
    colors: {
      primary: { 500: '139 92 246', 400: '167 139 250', 300: '196 181 253' }, // Violet
      secondary: { 500: '236 72 153', 400: '244 114 182' }, // Pink
      base: {
        900: '5 5 5', 800: '24 24 27', 700: '39 39 42', // Black/Zinc
        600: '63 63 70', 500: '82 82 91', 400: '161 161 170',
        300: '212 212 216', 200: '228 228 231', 100: '244 244 245'
      }
    }
  },
  ocean: {
    name: '深海 (Ocean)',
    preview: 'bg-blue-500',
    colors: {
      primary: { 500: '59 130 246', 400: '96 165 250', 300: '147 197 253' }, // Blue
      secondary: { 500: '6 182 212', 400: '34 211 238' }, // Cyan
      base: {
        900: '10 16 35', 800: '23 37 84', 700: '30 58 138', // Deep Blue
        600: '71 85 105', 500: '100 116 139', 400: '148 163 184',
        300: '203 213 225', 200: '226 232 240', 100: '241 245 249'
      }
    }
  },
  sunset: {
    name: '日落 (Sunset)',
    preview: 'bg-rose-500',
    colors: {
      primary: { 500: '244 63 94', 400: '251 113 133', 300: '253 164 175' }, // Rose
      secondary: { 500: '249 115 22', 400: '251 146 60' }, // Orange
      base: {
        900: '28 25 23', 800: '41 37 36', 700: '68 64 60', // Stone
        600: '87 83 78', 500: '120 113 108', 400: '168 162 158',
        300: '214 211 209', 200: '231 229 228', 100: '245 245 244'
      }
    }
  }
};

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem('nebula_theme') as ThemeId) || 'default';
  });

  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;

    // Apply primary colors
    Object.entries(theme.colors.primary).forEach(([shade, value]) => {
      root.style.setProperty(`--primary-${shade}`, value as string);
    });

    // Apply secondary colors
    Object.entries(theme.colors.secondary).forEach(([shade, value]) => {
      root.style.setProperty(`--secondary-${shade}`, value as string);
    });

    // Apply base colors
    Object.entries(theme.colors.base).forEach(([shade, value]) => {
      root.style.setProperty(`--base-${shade}`, value as string);
    });

    localStorage.setItem('nebula_theme', currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};