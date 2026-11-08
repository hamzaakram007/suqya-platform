import type { Metadata } from 'next';
import { SupportContent } from '@/components/SupportContent';
import { SiteChrome } from '@/components/SiteChrome';
import { copy } from '@/lib/i18n';

export const metadata: Metadata = {
  title: copy.en.support,
  description: copy.en.supportLede,
  alternates: { languages: { ar: '/support', en: '/en/support' } },
};

export default function EnglishSupportPage() {
  return (
    <SiteChrome locale="en" page="support">
      <SupportContent locale="en" />
    </SiteChrome>
  );
}
