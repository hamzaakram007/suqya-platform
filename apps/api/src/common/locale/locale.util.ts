import { AppLocale, DEFAULT_LOCALE } from './locale.types';

export function parseAcceptLanguage(header?: string | null): AppLocale | null {
  if (!header) return null;
  const primary = header.split(',')[0]?.trim().toLowerCase() ?? '';
  if (primary.startsWith('en')) return 'en';
  if (primary.startsWith('ar')) return 'ar';
  return null;
}

export function normalizeLocale(value?: string | null): AppLocale {
  if (!value) return DEFAULT_LOCALE;
  const v = value.toLowerCase().slice(0, 2);
  return v === 'en' ? 'en' : 'ar';
}

/** Resolve bilingual catalog name for display; keep raw Ar/En for editors. */
export function localizeName<T extends { nameAr?: string | null; nameEn?: string | null; name?: string | null }>(
  row: T,
  locale: AppLocale,
): T & { name: string } {
  const name =
    locale === 'en'
      ? row.nameEn ?? row.nameAr ?? row.name ?? ''
      : row.nameAr ?? row.nameEn ?? row.name ?? '';
  return { ...row, name };
}

export function localizeFaq(
  faq: {
    id: string;
    questionAr: string;
    questionEn: string;
    answerAr: string;
    answerEn: string;
    category: string;
    sortOrder: number;
  },
  locale: AppLocale,
) {
  return {
    id: faq.id,
    category: faq.category,
    sortOrder: faq.sortOrder,
    question: locale === 'en' ? faq.questionEn : faq.questionAr,
    answer: locale === 'en' ? faq.answerEn : faq.answerAr,
    questionAr: faq.questionAr,
    questionEn: faq.questionEn,
    answerAr: faq.answerAr,
    answerEn: faq.answerEn,
  };
}
