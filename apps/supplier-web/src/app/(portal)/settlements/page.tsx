'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { PageHeader, LoadingState, ErrorState } from '@/components/PageShell';
import { useLocaleContext } from '@/providers/locale-provider';
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

interface Settlement {
  id: string;
  periodStart: string;
  periodEnd: string;
  netAmount: number;
  status: string;
}

interface SettlementsResponse {
  data: Settlement[];
}

export default function SettlementsPage() {
  const t = useTranslations();
  const { locale } = useLocaleContext();
  const { data, isLoading, error } = useQuery({
    queryKey: ['supplier', 'settlements'],
    queryFn: () => apiFetch<SettlementsResponse>('/settlements'),
  });

  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';
  const rows = data?.data ?? [];
  const total = rows.reduce((s, r) => s + Number(r.netAmount), 0);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t('nav_money')}
        description={t('money_description')}
        actions={
          <Link href="/analytics">
            <Button variant="ghost">{t('nav_analytics')}</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label={t('settlement_cycles')} value={String(rows.length)} />
        <Kpi label={t('net')} value={total.toLocaleString(dateLocale)} delta={t('sar')} />
        <Kpi
          label={t('pending_label')}
          value={String(rows.filter((r) => r.status !== 'paid').length)}
        />
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && rows.length === 0 && (
        <EmptyState title={t('no_settlements')} description={t('no_settlements_here')} />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((s) => (
          <Card key={s.id} selected={s.status !== 'paid'}>
            <CardHeader>
              <CardTitle className="text-xl text-[var(--sq-primary)]">
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
