'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { LiveMap } from '@/components/LiveMap';
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
  Skeleton,
} from '@suqya/ui-kit';
import { useLocaleContext } from '@/providers/locale-provider';

interface Analytics {
  totalOrders: number;
  completedOrders: number;
  activeDrivers: number;
  activeSuppliers: number;
  totalRevenue: number;
  completionRate: number;
}

interface Dispute {
  id: string;
  orderId: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface OpsAlert {
  type: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  supplierId?: string;
  count?: number;
}

interface OpsAlertsResponse {
  alerts: OpsAlert[];
  summary: {
    delayedCount: number;
    overloadedCount: number;
    offlineDrivers: number;
  };
}

export default function LiveOpsPage() {
  const t = useTranslations();
  const { locale } = useLocaleContext();

  const analytics = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => apiFetch<Analytics>('/admin/analytics'),
  });

  const disputes = useQuery({
    queryKey: ['disputes', 'rail'],
    queryFn: () => apiFetch<Dispute[]>('/disputes'),
  });

  const opsAlerts = useQuery({
    queryKey: ['analytics', 'ops-alerts', locale],
    queryFn: () => apiFetch<OpsAlertsResponse>('/analytics/ops-alerts'),
  });

  const exceptions = (disputes.data ?? []).slice(0, 4);
  const alerts = (opsAlerts.data?.alerts ?? []).slice(0, 6);
  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <section className="relative min-h-[60vh] flex-1 lg:min-h-screen">
        <div className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-b from-[var(--sq-bg)]/95 to-transparent px-5 py-4">
          <div className="sq-fade-up">
            <p className="text-xs font-medium text-[var(--sq-text-secondary)]">
              {t('admin_command_center')}
            </p>
            <h1 className="text-2xl font-bold text-[var(--sq-text)] md:text-3xl">
              {t('nav_live_ops_direct')}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {analytics.isLoading ? (
              <>
                <Skeleton className="h-20 w-36" />
                <Skeleton className="h-20 w-36" />
                <Skeleton className="h-20 w-36" />
              </>
            ) : analytics.error ? null : (
              <>
                <Kpi
                  label={t('active_orders')}
                  value={String(analytics.data?.totalOrders ?? 0)}
                  className="bg-[var(--sq-surface)]/90 backdrop-blur-sm"
                />
                <Kpi
                  label={t('nav_drivers')}
                  value={String(analytics.data?.activeDrivers ?? 0)}
                  className="bg-[var(--sq-surface)]/90 backdrop-blur-sm"
                />
                <Kpi
                  label={t('completion')}
                  value={`${analytics.data?.completionRate ?? 0}%`}
                  delta={t('today')}
                  className="bg-[var(--sq-surface)]/90 backdrop-blur-sm"
                />
              </>
            )}
          </div>
        </div>
        <LiveMap fullBleed className="h-full min-h-[60vh] lg:min-h-screen" />
      </section>

      <aside className="flex w-full flex-col border-s border-[var(--sq-border)] bg-[var(--sq-surface)] lg:w-[340px]">
        <div className="border-b border-[var(--sq-border)] px-5 py-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[var(--sq-text)]">{t('exceptions_rail')}</h2>
              <p className="text-sm text-[var(--sq-text-secondary)]">{t('exceptions_rail_sub')}</p>
            </div>
            <Link href="/disputes">
              <Button variant="ghost" className="min-h-10 px-3 text-sm">
                {t('view_all')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-auto p-4">
          {opsAlerts.isLoading && disputes.isLoading && <LoadingState rows={4} />}
          {opsAlerts.error && <ErrorState message={opsAlerts.error.message} />}

          {alerts.map((a, i) => (
            <Card
              key={`${a.type}-${a.orderId ?? a.supplierId ?? a.count ?? i}`}
              className="sq-fade-up border-[var(--sq-border)] border-s-4 border-s-[var(--sq-warning,orange)]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <CardHeader className="mb-1">
                <CardTitle className="text-base">
                  {a.type === 'delayed_delivery'
                    ? t('alert_delayed')
                    : a.type === 'overloaded_supplier'
                      ? t('alert_overload')
                      : t('alert_offline_drivers')}
                </CardTitle>
                <CardDescription>{a.message}</CardDescription>
              </CardHeader>
            </Card>
          ))}

          {disputes.isLoading && <LoadingState rows={2} />}
          {disputes.error && <ErrorState message={disputes.error.message} />}
          {disputes.data && exceptions.length === 0 && alerts.length === 0 && (
            <EmptyState title={t('no_exceptions')} description={t('no_exceptions_desc')} />
          )}

          {exceptions.map((d, i) => (
            <Card
              key={d.id}
              className="sq-fade-up cursor-default border-[var(--sq-border)] hover:border-[var(--sq-primary)]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardHeader className="mb-1">
                <CardTitle className="text-base">{d.reason}</CardTitle>
                <CardDescription>
                  {t('nav_orders')} {d.orderId.slice(0, 8)}… · {d.status}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-[var(--sq-text-secondary)]">
                  {new Date(d.createdAt).toLocaleString(dateLocale)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-2 border-t border-[var(--sq-border)] p-4">
          <Link href="/dispatch" className="block">
            <Button variant="secondary" className="w-full">
              {t('open_dispatch')}
            </Button>
          </Link>
          <Link href="/orders" className="block">
            <Button variant="ghost" className="w-full">
              {t('view_orders')}
            </Button>
          </Link>
        </div>
      </aside>
    </div>
  );
}
