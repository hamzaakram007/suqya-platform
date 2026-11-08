import type { Metadata } from 'next';
import { PrivacyContent } from '@/components/PrivacyContent';
import { SiteChrome } from '@/components/SiteChrome';
import { copy } from '@/lib/i18n';

export const metadata: Metadata = {
  title: copy.ar.privacy,
  description: copy.ar.privacyLede,
  alternates: { languages: { ar: '/privacy', en: '/en/privacy' } },
};

export default function PrivacyPage() {
  return (
    <SiteChrome locale="ar" page="privacy">
      <PrivacyContent locale="ar" />
    </SiteChrome>
  );
}
