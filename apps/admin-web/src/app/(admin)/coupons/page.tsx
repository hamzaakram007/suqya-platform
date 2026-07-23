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

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  isActive: boolean;
  usedCount: number;
}

export default function CouponsPage() {
  const t = useTranslations();
  const { data, isLoading, error } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => apiFetch<Coupon[]>('/coupons'),
  });

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('nav_coupons_admin')} description={t('coupons_description')} />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && data.length === 0 && (
        <EmptyState title={t('no_coupons')} description={t('no_coupons_desc')} />
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((c) => (
          <Card key={c.id} selected={c.isActive}>
            <CardHeader>
              <CardTitle className="font-mono text-base" dir="ltr">
                {c.code}
              </CardTitle>
              <CardDescription>
                {c.discountType} · {c.discountValue}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-[var(--sq-text-secondary)]">
              {t('coupon_used', { count: c.usedCount })} ·{' '}
              {c.isActive ? t('active_status') : t('inactive_status')}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
