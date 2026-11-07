import type { Locale } from '@suqya/i18n';

export const LOCALE_STORAGE_KEY = 'suqya_locale';
export const DEFAULT_LOCALE: Locale = 'ar';
export const locales: Locale[] = ['ar', 'en'];

export function isValidLocale(value: string | null | undefined): value is Locale {
  return value === 'ar' || value === 'en';
}
