'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import type { Locale } from '@suqya/i18n';
import { getMessages } from '@/i18n/messages';
import { DEFAULT_LOCALE, isValidLocale, LOCALE_STORAGE_KEY } from '@/i18n/config';
import { applyDocumentLocale, setStoredLocale, syncUserLanguage } from '@/lib/locale';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isValidLocale(stored)) {
      setLocaleState(stored);
      applyDocumentLocale(stored);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setStoredLocale(next);
    setLocaleState(next);
    applyDocumentLocale(next);
    void syncUserLanguage(next);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
  const messages = useMemo(() => getMessages(locale), [locale]);

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocaleContext must be used within LocaleProvider');
  return ctx;
}
