'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { PageHeader, LoadingState, ErrorState } from '@/components/PageShell';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Kpi,
} from '@suqya/ui-kit';
import { useLocaleContext } from '@/providers/locale-provider';

interface Settlement {
  id: string;
  periodStart: string;
  periodEnd: string;
  netAmount: number;
  status: string;
}

interface SettlementsResponse {
  data: Settlement[];
  meta: { total: number };
}

export default function FinancePage() {
  const t = useTranslations();
  const { locale } = useLocaleContext();
  const { data, isLoading, error } = useQuery({
    queryKey: ['settlements'],
    queryFn: () => apiFetch<SettlementsResponse>('/settlements'),
  });

  const rows = data?.data ?? [];
  const totalNet = rows.reduce((sum, s) => sum + Number(s.netAmount), 0);
  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t('nav_finance')}
        description={t('finance_description')}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/credit-aging">
              <Button variant="ghost">{t('credit_aging')}</Button>
            </Link>
            <Link href="/coupons">
              <Button variant="ghost">{t('nav_coupons_admin')}</Button>
            </Link>
            <Link href="/analytics">
              <Button variant="secondary">{t('nav_analytics')}</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label={t('settlements_kpi')} value={String(data?.meta.total ?? rows.length)} />
        <Kpi
          label={t('aggregated_net')}
          value={`${totalNet.toLocaleString(dateLocale)}`}
          delta={t('sar')}
        />
        <Kpi
          label={t('processing')}
          value={String(rows.filter((s) => s.status !== 'paid').length)}
        />
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}

      {data && rows.length === 0 && (
        <EmptyState title={t('no_settlements')} description={t('no_settlements_desc')} />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {Number(s.netAmount).toLocaleString(dateLocale)} {t('sar')}
              </CardTitle>
              <CardDescription>
                {new Date(s.periodStart).toLocaleDateString(dateLocale)} —{' '}
                {new Date(s.periodEnd).toLocaleDateString(dateLocale)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="rounded-[var(--sq-radius-sm)] bg-[var(--sq-primary-muted)] px-2 py-1 text-xs font-medium text-[var(--sq-primary)]">
                {s.status}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
