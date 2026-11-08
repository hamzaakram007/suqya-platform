import Link from 'next/link';
import { HtmlAttributes } from '@/components/HtmlAttributes';
import type { Locale } from '@/lib/i18n';
import { copy, otherLocale } from '@/lib/i18n';

type PageKey = 'home' | 'privacy' | 'support';

export function SiteChrome({
  locale,
  page,
  children,
}: {
  locale: Locale;
  page: PageKey;
  children: React.ReactNode;
}) {
  const t = copy[locale];
  const prefix = locale === 'ar' ? '' : '/en';
  const flip = otherLocale(locale);
  const flipHref =
    page === 'home'
      ? flip === 'ar'
        ? '/'
        : '/en'
      : flip === 'ar'
        ? `/${page}`
        : `/en/${page}`;

  return (
    <div className="shell">
      <HtmlAttributes locale={locale} />
      <header className="topbar">
        <Link className="brand" href={prefix || '/'}>
          <span className="brand-mark" aria-hidden>
            س
          </span>
          <span>{t.brand}</span>
        </Link>
        <nav className="nav" aria-label={locale === 'ar' ? 'التنقل' : 'Navigation'}>
          <Link href={prefix || '/'} aria-current={page === 'home' ? 'page' : undefined}>
            {t.home}
          </Link>
          <Link
            href={`${prefix}/privacy`}
            aria-current={page === 'privacy' ? 'page' : undefined}
          >
            {t.privacy}
          </Link>
          <Link
            href={`${prefix}/support`}
            aria-current={page === 'support' ? 'page' : undefined}
          >
            {t.support}
          </Link>
          <Link className="lang-btn" href={flipHref} hrefLang={flip} lang={flip}>
            {t.langSwitch}
          </Link>
        </nav>
      </header>
      <main className="panel">{children}</main>
      <p className="footer">{t.notLegalAdvice}</p>
    </div>
  );
}
