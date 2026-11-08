import type { Metadata } from 'next';
import { PrivacyContent } from '@/components/PrivacyContent';
import { SiteChrome } from '@/components/SiteChrome';
import { copy } from '@/lib/i18n';

export const metadata: Metadata = {
  title: copy.en.privacy,
  description: copy.en.privacyLede,
  alternates: { languages: { ar: '/privacy', en: '/en/privacy' } },
};

export default function EnglishPrivacyPage() {
  return (
    <SiteChrome locale="en" page="privacy">
      <PrivacyContent locale="en" />
    </SiteChrome>
  );
}
