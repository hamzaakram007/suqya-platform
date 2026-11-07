'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { PageHeader, LoadingState, ErrorState } from '@/components/PageShell';
import { LiveMap } from '@/components/LiveMap';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from '@suqya/ui-kit';

interface DriverCandidate {
  driverId: string;
  distance: number;
  score: number;
  latitude: number;
  longitude: number;
}

export default function DispatchPage() {
  const t = useTranslations();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dispatch', 'nearby'],
    queryFn: () =>
      apiFetch<DriverCandidate[]>(
        '/dispatch/nearby-drivers?lat=24.7136&lng=46.6753&capacity=10000',
      ),
  });

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('nav_dispatch')} description={t('dispatch_description')} />
      <LiveMap />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && data.length === 0 && (
        <EmptyState title={t('no_nearby_drivers')} description={t('no_nearby_drivers_desc')} />
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data?.map((d) => (
          <Card key={d.driverId}>
            <CardHeader>
              <CardTitle className="text-base font-mono" dir="ltr">
                {d.driverId.slice(0, 8)}…
              </CardTitle>
              <CardDescription>
                {d.distance.toFixed(1)} {t('distance_km')} · {t('score_points')}{' '}
                {d.score.toFixed(0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--sq-text-secondary)]" dir="ltr">
                {d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
