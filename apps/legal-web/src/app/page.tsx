import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';
import { copy } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'سقيا — صفحات عامة للمتاجر',
  alternates: { languages: { ar: '/', en: '/en' } },
};

export default function HomePage() {
  const t = copy.ar;
  return (
    <SiteChrome locale="ar" page="home">
      <h1>{t.homeTitle}</h1>
      <p className="lede">{t.homeLede}</p>
      <ul>
        <li>
          <Link href="/privacy">{t.privacy}</Link>
        </li>
        <li>
          <Link href="/support">{t.support}</Link>
        </li>
        <li>
          <Link href="/en">English version</Link>
        </li>
      </ul>
    </SiteChrome>
  );
}
