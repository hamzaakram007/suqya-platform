'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/PageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@suqya/ui-kit';
import { useAuth } from '@/providers/auth-provider';

export default function SettingsPage() {
  const t = useTranslations();
  const { session } = useAuth();

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('settings')} description={t('settings_description')} />
      <Card>
        <CardHeader>
          <CardTitle>{t('settings_account')}</CardTitle>
          <CardDescription>{t('settings_session')}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--sq-text-secondary)]">{t('settings_phone')}</dt>
              <dd className="font-medium" dir="ltr">
                {session?.user.phone}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--sq-text-secondary)]">{t('settings_role')}</dt>
              <dd className="font-medium">{session?.user.role}</dd>
            </div>
            <div>
              <dt className="text-[var(--sq-text-secondary)]">{t('settings_tenant')}</dt>
              <dd className="font-medium">default-tenant</dd>
            </div>
            <div>
              <dt className="text-[var(--sq-text-secondary)]">{t('settings_api')}</dt>
              <dd className="font-medium text-xs" dir="ltr">
                {process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
