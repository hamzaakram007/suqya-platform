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

interface SupplierRow {
  id: string;
  companyName: string;
  status: string;
  user?: { phone: string; profile?: { nameAr?: string } };
  _count: { drivers: number; trucks: number };
}

export default function SuppliersPage() {
  const t = useTranslations();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'suppliers'],
    queryFn: () => apiFetch<SupplierRow[]>('/admin/suppliers'),
  });

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('nav_suppliers')} description={t('suppliers_description')} />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && data.length === 0 && (
        <EmptyState title={t('no_suppliers')} description={t('no_suppliers_desc')} />
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data?.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle className="text-base">{s.companyName}</CardTitle>
              <CardDescription>{s.status}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 text-sm text-[var(--sq-text-secondary)]">
              <span>
                {s._count.drivers} {t('drivers_unit')}
              </span>
              <span>
                {s._count.trucks} {t('trucks_unit')}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
