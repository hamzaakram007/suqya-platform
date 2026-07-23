'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { useLocaleContext } from '@/providers/locale-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
}

export function OrdersTable() {
  const t = useTranslations();
  const { locale } = useLocaleContext();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'orders', 'recent'],
    queryFn: () => apiFetch<OrdersResponse>('/admin/orders?limit=5'),
  });

  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      in_transit: t('in_transit'),
      completed: t('delivered'),
      supplier_review: t('status_review'),
    };
    return map[status] ?? status;
  };

  const orders = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>{t('recent_activity')}</CardTitle>
          <CardDescription>{t('recent_orders_desc')}</CardDescription>
        </div>
        <Link
          href="/orders"
          className="text-sm font-medium text-[var(--sq-primary)] hover:underline"
        >
          {t('view_all')}
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <p className="text-sm text-[var(--sq-text-secondary)]">{t('loading')}</p>
        )}
        {error && <p className="text-sm text-[var(--sq-error)]">{error.message}</p>}
        {!isLoading && !error && orders.length === 0 && (
          <p className="text-sm text-[var(--sq-text-secondary)]">{t('no_orders')}</p>
        )}
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between gap-3 rounded-[var(--sq-radius-md)] border border-[var(--sq-border)] px-3 py-2.5"
          >
            <div>
              <p className="font-medium text-[var(--sq-text)]">{order.orderNumber}</p>
              <p className="text-xs text-[var(--sq-text-secondary)]">
                {order.customer?.profile?.nameAr ??
                  order.customer?.profile?.nameEn ??
                  '—'}{' '}
                · {statusLabel(order.status)}
              </p>
            </div>
            <p className="text-sm font-semibold text-[var(--sq-primary)]">
              {Number(order.totalAmount).toLocaleString(dateLocale)} {t('sar')}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
