'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/i18n/translations';

export type ThemeMode = 'light' | 'dark';
export type Language = 'ar' | 'en';

interface ThemeLanguageContextType {
  theme: ThemeMode;
  lang: Language;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isDark: boolean;
  dir: 'rtl' | 'ltr';
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export function ThemeLanguageProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [lang, setLangState] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Restore Theme
    const storedTheme = localStorage.getItem('theme') as ThemeMode | null;
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme: ThemeMode = storedTheme || (systemPrefersDark ? 'dark' : 'light');

    setThemeState(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Restore Language
    const storedLang = localStorage.getItem('lang') as Language | null;
    const initialLang: Language = storedLang === 'en' ? 'en' : 'ar';

    setLangState(initialLang);
    document.documentElement.setAttribute('lang', initialLang);
    document.documentElement.setAttribute('dir', initialLang === 'ar' ? 'rtl' : 'ltr');

    setMounted(true);
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.setAttribute('lang', newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
  };

  const t = (key: string, fallback?: string): string => {
    const dictItem = translations[key];
    if (dictItem && dictItem[lang]) {
      return dictItem[lang];
    }
    return fallback || key;
  };

  const isDark = theme === 'dark';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Prevent flash of incorrect initial layout on hydration
  return (
    <ThemeLanguageContext.Provider
      value={{
        theme,
        lang,
        toggleTheme,
        toggleLanguage,
        setTheme,
        setLanguage,
        t,
        isDark,
        dir,
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useThemeLanguage() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
}
