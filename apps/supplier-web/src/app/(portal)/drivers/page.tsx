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
  Kpi,
} from '@suqya/ui-kit';

interface DriverRow {
  id: string;
  isOnline: boolean;
  user?: { phone: string; profile?: { nameAr?: string; nameEn?: string } };
  truck?: { plateNumber: string };
}

interface FleetResponse {
  trucks: unknown[];
  drivers: DriverRow[];
}

export default function DriversPage() {
  const t = useTranslations();
  const { data, isLoading, error } = useQuery({
    queryKey: ['supplier', 'fleet'],
    queryFn: () => apiFetch<FleetResponse>('/suppliers/fleet'),
  });

  const drivers = data?.drivers ?? [];
  const online = drivers.filter((d) => d.isOnline).length;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('nav_drivers')} description={t('drivers_shifts_desc')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi label={t('all')} value={String(drivers.length)} />
        <Kpi label={t('online_count')} value={String(online)} />
      </div>
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && drivers.length === 0 && (
        <EmptyState title={t('no_drivers')} description={t('add_drivers_fleet')} />
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {drivers.map((d) => (
          <Card key={d.id} selected={d.isOnline}>
            <CardHeader>
              <CardTitle className="text-base">
                {d.user?.profile?.nameAr ?? d.user?.profile?.nameEn ?? '—'}
              </CardTitle>
              <CardDescription>
                {d.isOnline ? t('online') : t('offline')} ·{' '}
                {d.truck?.plateNumber ?? t('no_truck')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--sq-text-secondary)]" dir="ltr">
                {d.user?.phone ?? '—'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
