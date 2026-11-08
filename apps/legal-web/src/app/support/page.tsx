import type { Metadata } from 'next';
import { SupportContent } from '@/components/SupportContent';
import { SiteChrome } from '@/components/SiteChrome';
import { copy } from '@/lib/i18n';

export const metadata: Metadata = {
  title: copy.ar.support,
  description: copy.ar.supportLede,
  alternates: { languages: { ar: '/support', en: '/en/support' } },
};

export default function SupportPage() {
  return (
    <SiteChrome locale="ar" page="support">
      <SupportContent locale="ar" />
    </SiteChrome>
  );
}
