'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { PageHeader, LoadingState, ErrorState } from '@/components/PageShell';
import { useLocaleContext } from '@/providers/locale-provider';
import { Card, CardContent, CardHeader, CardTitle, Kpi } from '@suqya/ui-kit';

interface DashboardAnalytics {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  completionRate: number;
}

interface TrendPoint {
  date: string;
  count: number;
  revenue: number;
}

export default function AnalyticsPage() {
  const t = useTranslations();
  const { locale } = useLocaleContext();
  const dashboard = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => apiFetch<DashboardAnalytics>('/analytics/dashboard'),
  });
  const trends = useQuery({
    queryKey: ['analytics', 'trends'],
    queryFn: () => apiFetch<TrendPoint[]>('/analytics/trends?days=7'),
  });

  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';
  const isLoading = dashboard.isLoading || trends.isLoading;
  const error = dashboard.error ?? trends.error;

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('nav_analytics')} description={t('analytics_supplier_desc')} />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {dashboard.data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Kpi label={t('total_orders')} value={String(dashboard.data.totalOrders)} />
          <Kpi label={t('completed_orders')} value={String(dashboard.data.completedOrders)} />
          <Kpi
            label={t('revenue')}
            value={dashboard.data.totalRevenue.toLocaleString(dateLocale)}
            delta={t('sar')}
          />
          <Kpi label={t('completion_rate')} value={`${dashboard.data.completionRate}%`} />
        </div>
      )}
      {trends.data && (
        <Card>
          <CardHeader>
            <CardTitle>{t('orders_trend_7d')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {trends.data.map((point) => (
                <li
                  key={point.date}
                  className="flex justify-between border-b border-[var(--sq-border)] pb-2 text-sm last:border-0"
                >
                  <span className="text-[var(--sq-text-secondary)]">{point.date}</span>
                  <span className="font-semibold">
                    {t('trend_row', {
                      count: point.count,
                      revenue: point.revenue.toLocaleString(dateLocale),
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
