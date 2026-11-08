'use client';

import { useEffect } from 'react';
import type { Locale } from '@/lib/i18n';
import { localeDir } from '@/lib/i18n';

export function HtmlAttributes({ locale }: { locale: Locale }) {
  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = localeDir(locale);
  }, [locale]);

  return null;
}
