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

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customer?: { profile?: { nameAr?: string; nameEn?: string } };
}

interface OrdersResponse {
  data: OrderRow[];
  meta: { total: number };
}

export default function OrdersPage() {
  const t = useTranslations();
  const { locale } = useLocaleContext();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => apiFetch<OrdersResponse>('/admin/orders'),
  });

  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: t('pending'),
      supplier_review: t('status_supplier_review'),
      assigned: t('status_assigned'),
      in_transit: t('in_transit'),
      completed: t('delivered'),
      cancelled: t('status_cancelled'),
    };
    return map[status] ?? status;
  };

  const orders = data?.data ?? [];
  const active = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const done = orders.filter((o) => o.status === 'completed');

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t('nav_orders')}
        description={t('orders_description')}
        actions={
          <Link href="/">
            <Button variant="ghost">{t('back_to_ops')}</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label={t('total')} value={String(data?.meta.total ?? orders.length)} />
        <Kpi label={t('active')} value={String(active.length)} />
        <Kpi label={t('completed_orders')} value={String(done.length)} />
      </div>

      {isLoading && <LoadingState rows={4} />}
      {error && <ErrorState message={error.message} />}

      {data && orders.length === 0 && (
        <EmptyState title={t('no_orders')} description={t('no_orders_desc')} />
      )}

      {data && orders.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((o, i) => (
            <Card
              key={o.id}
              className="sq-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <CardHeader>
                <CardTitle className="text-base">{o.orderNumber}</CardTitle>
                <CardDescription>
                  {o.customer?.profile?.nameAr ??
                    o.customer?.profile?.nameEn ??
                    t('customer')}{' '}
                  · {statusLabel(o.status)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[var(--sq-primary)]">
                  {Number(o.totalAmount).toLocaleString(dateLocale)}{' '}
                  <span className="text-sm font-medium text-[var(--sq-text-secondary)]">
                    {t('sar')}
                  </span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
