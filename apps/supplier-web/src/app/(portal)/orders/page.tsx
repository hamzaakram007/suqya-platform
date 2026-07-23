'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
} from '@suqya/ui-kit';

interface OrderRow {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customer?: { profile?: { nameAr?: string; nameEn?: string } };
}

export default function OrdersPage() {
  const t = useTranslations();
  const { locale } = useLocaleContext();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['supplier', 'orders'],
    queryFn: () => apiFetch<OrderRow[]>('/suppliers/orders'),
  });

  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';

  const columns = [
    { id: 'review', label: t('column_review'), statuses: ['supplier_review', 'pending'] },
    {
      id: 'active',
      label: t('column_active'),
      statuses: ['assigned', 'in_transit', 'accepted'],
    },
    { id: 'done', label: t('column_done'), statuses: ['completed', 'delivered'] },
  ];

  const acceptMutation = useMutation({
    mutationFn: (orderId: string) =>
      apiFetch(`/suppliers/orders/${orderId}/accept`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supplier', 'orders'] }),
  });

  const orders = data ?? [];

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('nav_orders')} description={t('orders_pipeline_desc')} />
      {isLoading && <LoadingState rows={4} />}
      {error && <ErrorState message={error.message} />}
      {data && orders.length === 0 && (
        <EmptyState title={t('no_orders')} description={t('no_orders_supplier_desc')} />
      )}

      {data && orders.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {columns.map((col) => {
            const colOrders = orders.filter((o) => col.statuses.includes(o.status));
            return (
              <div key={col.id} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="font-bold text-[var(--sq-text)]">{col.label}</h2>
                  <span className="rounded-full bg-[var(--sq-primary-muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--sq-primary)]">
                    {colOrders.length}
                  </span>
                </div>
                <div className="min-h-[200px] space-y-3 rounded-[var(--sq-radius-xl)] border border-dashed border-[var(--sq-border)] bg-[var(--sq-bg)]/60 p-3">
                  {colOrders.length === 0 && (
                    <p className="py-8 text-center text-sm text-[var(--sq-text-secondary)]">
                      {t('column_empty')}
                    </p>
                  )}
                  {colOrders.map((o) => (
                    <Card key={o.id} className="shadow-[var(--sq-shadow-sm)]">
                      <CardHeader className="mb-2">
                        <CardTitle className="text-base">{o.orderNumber}</CardTitle>
                        <CardDescription>
                          {o.customer?.profile?.nameAr ??
                            o.customer?.profile?.nameEn ??
                            t('customer')}{' '}
                          · {o.status}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-xl font-bold text-[var(--sq-primary)]">
                          {Number(o.totalAmount).toLocaleString(dateLocale)} {t('sar')}
                        </p>
                        {o.status === 'supplier_review' && (
                          <Button
                            className="w-full"
                            loading={acceptMutation.isPending}
                            onClick={() => acceptMutation.mutate(o.id)}
                          >
                            {t('accept_job')}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
