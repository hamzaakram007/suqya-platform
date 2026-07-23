import { dirFor, type Locale } from '@suqya/i18n';
import { DEFAULT_LOCALE, isValidLocale, LOCALE_STORAGE_KEY } from '@/i18n/config';

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  return isValidLocale(localStorage.getItem(LOCALE_STORAGE_KEY))
    ? (localStorage.getItem(LOCALE_STORAGE_KEY) as Locale)
    : DEFAULT_LOCALE;
}

export function setStoredLocale(locale: Locale) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function applyDocumentLocale(locale: Locale) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
  document.documentElement.dir = dirFor(locale);
}

export async function syncUserLanguage(locale: Locale) {
  const { apiFetch } = await import('@/lib/api');
  try {
    await apiFetch('/users/me/language', {
      method: 'PATCH',
      body: JSON.stringify({ preferredLanguage: locale }),
    });
  } catch {
    // Ignore when unauthenticated or offline
  }
}
