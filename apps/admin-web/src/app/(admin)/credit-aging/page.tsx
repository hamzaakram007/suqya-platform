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
} from '@suqya/ui-kit';

interface AgingAccount {
  customerId: string;
  customerName?: string;
  outstandingBalance: number;
  aging: { current: number; days30: number; days60: number; days90: number };
}

export default function CreditAgingPage() {
  const t = useTranslations();
  const { locale } = useLocaleContext();
  const { data, isLoading, error } = useQuery({
    queryKey: ['credit', 'aging'],
    queryFn: () => apiFetch<AgingAccount[]>('/credit/aging'),
  });

  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';

  const totals = data?.reduce(
    (acc, row) => ({
      current: acc.current + row.aging.current,
      days30: acc.days30 + row.aging.days30,
      days60: acc.days60 + row.aging.days60,
      days90: acc.days90 + row.aging.days90,
    }),
    { current: 0, days30: 0, days60: 0, days90: 0 },
  );

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('credit_aging')} description={t('credit_aging_description')} />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {totals && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Kpi
            label={t('aging_current')}
            value={totals.current.toLocaleString(dateLocale)}
            delta={t('sar')}
          />
          <Kpi
            label={t('aging_30')}
            value={totals.days30.toLocaleString(dateLocale)}
            delta={t('sar')}
          />
          <Kpi
            label={t('aging_60')}
            value={totals.days60.toLocaleString(dateLocale)}
            delta={t('sar')}
          />
          <Kpi
            label={t('aging_90')}
            value={totals.days90.toLocaleString(dateLocale)}
            delta={t('sar')}
          />
        </div>
      )}
      {data && data.length === 0 && (
        <EmptyState title={t('no_accounts')} description={t('no_accounts_desc')} />
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data?.map((row) => (
          <Card key={row.customerId}>
            <CardHeader>
              <CardTitle className="text-base">
                {row.customerName ?? row.customerId.slice(0, 8)}
              </CardTitle>
              <CardDescription>
                {t('outstanding_amount', {
                  amount: `${Number(row.outstandingBalance).toLocaleString(dateLocale)} ${t('sar')}`,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-xs text-[var(--sq-text-secondary)] sm:grid-cols-4">
              <span>
                {t('aging_current')} {row.aging.current.toLocaleString(dateLocale)}
              </span>
              <span>30 {row.aging.days30.toLocaleString(dateLocale)}</span>
              <span>60 {row.aging.days60.toLocaleString(dateLocale)}</span>
              <span>90+ {row.aging.days90.toLocaleString(dateLocale)}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
