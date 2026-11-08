import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteChrome } from '@/components/SiteChrome';
import { copy } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Suqya — public store pages',
  description: copy.en.homeLede,
  alternates: { languages: { ar: '/', en: '/en' } },
};

export default function EnglishHomePage() {
  const t = copy.en;
  return (
    <SiteChrome locale="en" page="home">
      <h1>{t.homeTitle}</h1>
      <p className="lede">{t.homeLede}</p>
      <ul>
        <li>
          <Link href="/en/privacy">{t.privacy}</Link>
        </li>
        <li>
          <Link href="/en/support">{t.support}</Link>
        </li>
        <li>
          <Link href="/">النسخة العربية</Link>
        </li>
      </ul>
    </SiteChrome>
  );
}
