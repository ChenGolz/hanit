'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { dictionary, locales } from './translations';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState('he');

  useEffect(() => {
    const stored = window.localStorage.getItem('petconnect-locale');
    if (stored && dictionary[stored]) {
      setLocale(stored);
    }
  }, []);

  useEffect(() => {
    const def = locales.find((item) => item.code === locale) || locales[0];
    document.documentElement.lang = locale;
    document.documentElement.dir = def.dir;
    document.body.dir = def.dir;
    window.localStorage.setItem('petconnect-locale', locale);
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale,
    t: (key) => dictionary[locale]?.[key] || dictionary.he[key] || key,
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used within I18nProvider');
  return value;
}
