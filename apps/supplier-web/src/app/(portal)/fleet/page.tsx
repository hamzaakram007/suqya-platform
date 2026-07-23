'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { PageHeader, LoadingState, ErrorState } from '@/components/PageShell';
import { useLocaleContext } from '@/providers/locale-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Kpi,
  MapShell,
} from '@suqya/ui-kit';

interface FleetResponse {
  trucks: Array<{
    id: string;
    plateNumber: string;
    capacityLiters: number;
    status: string;
  }>;
  drivers: Array<unknown>;
}

export default function FleetPage() {
  const t = useTranslations();
  const { locale } = useLocaleContext();
  const { data, isLoading, error } = useQuery({
    queryKey: ['supplier', 'fleet'],
    queryFn: () => apiFetch<FleetResponse>('/suppliers/fleet'),
  });

  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';
  const trucks = data?.trucks ?? [];
  const online = trucks.filter((truck) => truck.status === 'available' || truck.status === 'active')
    .length;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('nav_fleet')} description={t('fleet_description')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label={t('trucks_kpi')} value={String(trucks.length)} />
        <Kpi label={t('available')} value={String(online)} />
        <Kpi label={t('nav_drivers')} value={String(data?.drivers.length ?? 0)} />
      </div>

      <MapShell
        className="min-h-[min(55vh,520px)]"
        overlay={
          <Card className="bg-[var(--sq-surface)]/95 backdrop-blur-sm shadow-[var(--sq-shadow-md)]">
            <CardContent className="space-y-1 p-0">
              <div className="flex items-center gap-2">
                <span className="sq-live-dot inline-block h-2.5 w-2.5 rounded-full bg-[var(--sq-primary)]" />
                <p className="text-sm font-semibold">{t('fleet_tracking')}</p>
              </div>
              <p className="text-xs text-[var(--sq-text-secondary)]">
                {t('trucks_registered', { count: trucks.length })}
              </p>
            </CardContent>
          </Card>
        }
      >
        <div className="relative z-[1] flex h-full min-h-[min(55vh,520px)] flex-col items-center justify-center gap-2 p-8 text-center">
          {[
            { top: '30%', right: '28%' },
            { top: '52%', right: '48%' },
            { top: '40%', right: '62%' },
          ].map((pos, i) => (
            <span
              key={i}
              className="absolute h-3.5 w-3.5 rounded-full bg-[var(--sq-primary)] shadow-[var(--sq-shadow-fab)]"
              style={{ top: pos.top, right: pos.right }}
            />
          ))}
          <p className="text-lg font-bold text-[var(--sq-primary)]">{t('fleet_map_title')}</p>
          <p className="max-w-sm text-sm text-[var(--sq-text-secondary)]">
            {t('fleet_map_live_desc')}
          </p>
        </div>
      </MapShell>

      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && trucks.length === 0 && (
        <EmptyState title={t('no_trucks')} description={t('no_trucks_desc')} />
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {trucks.map((truck) => (
          <Card key={truck.id}>
            <CardHeader>
              <CardTitle className="font-mono text-base" dir="ltr">
                {truck.plateNumber}
              </CardTitle>
              <CardDescription>{truck.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--sq-text-secondary)]">
                {t('capacity_liters', {
                  amount: truck.capacityLiters.toLocaleString(dateLocale),
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
