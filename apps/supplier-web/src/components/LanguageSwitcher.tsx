'use client';

import { Languages } from 'lucide-react';
import { Button } from '@suqya/ui-kit';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/providers/locale-provider';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const t = useTranslations();
  const { locale, setLocale } = useLocaleContext();
  const next = locale === 'ar' ? 'en' : 'ar';

  return (
    <Button
      type="button"
      variant="ghost"
      className={compact ? 'h-9 gap-1.5 px-2 text-xs' : 'w-full justify-start gap-2'}
      onClick={() => setLocale(next)}
      aria-label={t('switch_language')}
      title={t('switch_language')}
    >
      <Languages className="h-4 w-4 shrink-0" />
      <span>{next === 'ar' ? t('language_ar') : t('language_en')}</span>
    </Button>
  );
}
