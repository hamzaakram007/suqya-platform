'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { LoadingState, ErrorState } from '@/components/PageShell';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Kpi,
  MapShell,
  Skeleton,
} from '@suqya/ui-kit';
import { useLocaleContext } from '@/providers/locale-provider';

interface SupplierDashboard {
  pendingOrders: number;
  completedToday: number;
  totalRevenue: number;
  onlineDrivers: number;
}

export default function TodayPage() {
  const t = useTranslations();
  const { locale } = useLocaleContext();
  const { data, isLoading, error } = useQuery({
    queryKey: ['supplier', 'dashboard'],
    queryFn: () => apiFetch<SupplierDashboard>('/suppliers/dashboard'),
  });

  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';

  return (
    <div className="space-y-6 p-6">
      <div className="sq-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[var(--sq-text-secondary)]">
            {t('supplier_portal')}
          </p>
          <h1 className="text-2xl font-bold text-[var(--sq-text)] md:text-3xl">{t('nav_today')}</h1>
          <p className="mt-1 text-sm text-[var(--sq-text-secondary)]">{t('today_subtitle')}</p>
        </div>
        <Link href="/orders">
          <Button>{t('review_orders')}</Button>
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}
      {error && <ErrorState message={error.message} />}

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label={t('pending_orders')} value={String(data.pendingOrders)} />
          <Kpi label={t('completed_today')} value={String(data.completedToday)} />
          <Kpi
            label={t('revenue')}
            value={data.totalRevenue.toLocaleString(dateLocale)}
            delta={t('sar')}
          />
          <Kpi label={t('online_drivers')} value={String(data.onlineDrivers)} />
        </div>
      )}

      <MapShell
        className="min-h-[380px]"
        overlay={
          <Card className="bg-[var(--sq-surface)]/95 backdrop-blur-sm shadow-[var(--sq-shadow-md)]">
            <CardContent className="space-y-1 p-0">
              <div className="flex items-center gap-2">
                <span className="sq-live-dot inline-block h-2.5 w-2.5 rounded-full bg-[var(--sq-primary)]" />
                <p className="text-sm font-semibold">{t('fleet_today')}</p>
              </div>
              <p className="text-xs text-[var(--sq-text-secondary)]">
                {t('drivers_online_now', { count: data?.onlineDrivers ?? '—' })}
              </p>
            </CardContent>
          </Card>
        }
      >
        <div className="relative z-[1] flex h-full min-h-[380px] flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="text-lg font-bold text-[var(--sq-primary)]">{t('fleet_map_title')}</p>
          <p className="max-w-sm text-sm text-[var(--sq-text-secondary)]">{t('fleet_map_desc')}</p>
        </div>
      </MapShell>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--sq-text)]">{t('next_steps')}</h2>
        {isLoading && <LoadingState rows={2} />}
        {data && data.pendingOrders === 0 && (
          <EmptyState
            title={t('all_under_control')}
            description={t('no_pending_orders_desc')}
            action={
              <Link href="/fleet">
                <Button variant="secondary">{t('open_fleet')}</Button>
              </Link>
            }
          />
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {(data?.pendingOrders ?? 0) > 0 && (
            <Card selected>
              <CardHeader>
                <CardTitle className="text-base">{t('accept_orders')}</CardTitle>
                <CardDescription>
                  {t('orders_waiting', { count: data?.pendingOrders ?? 0 })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/orders">
                  <Button className="w-full">{t('go_to_pipeline')}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('fleet_status')}</CardTitle>
              <CardDescription>{t('fleet_status_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/fleet">
                <Button variant="secondary" className="w-full">
                  {t('map_btn')}
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('nav_settlements')}</CardTitle>
              <CardDescription>{t('settlements_review')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settlements">
                <Button variant="ghost" className="w-full">
                  {t('nav_money')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
