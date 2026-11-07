'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { PageHeader, LoadingState, ErrorState } from '@/components/PageShell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from '@suqya/ui-kit';

interface DriverRow {
  id: string;
  isOnline: boolean;
  user?: { phone: string; profile?: { nameAr?: string } };
  truck?: { plateNumber: string };
  supplier?: { companyName: string };
}

export default function DriversPage() {
  const t = useTranslations();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'drivers'],
    queryFn: () => apiFetch<DriverRow[]>('/admin/drivers'),
  });

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('nav_drivers')} description={t('drivers_description')} />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && data.length === 0 && (
        <EmptyState title={t('no_drivers')} description={t('no_drivers_desc')} />
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((d) => (
          <Card key={d.id} selected={d.isOnline}>
            <CardHeader>
              <CardTitle className="text-base">
                {d.user?.profile?.nameAr ?? d.truck?.plateNumber ?? '—'}
              </CardTitle>
              <CardDescription>
                {d.isOnline ? t('online') : t('offline')} · {d.supplier?.companyName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--sq-text-secondary)]" dir="ltr">
                {d.user?.phone}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
