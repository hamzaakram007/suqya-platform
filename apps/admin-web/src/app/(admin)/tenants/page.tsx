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

interface Tenant {
  id: string;
  name: string;
  nameAr?: string;
  mode: string;
  status: string;
  _count: { users: number; orders: number };
}

const manageLinkKeys = [
  { href: '/users', labelKey: 'nav_users', hintKey: 'manage_users_hint' },
  { href: '/drivers', labelKey: 'nav_drivers', hintKey: 'manage_drivers_hint' },
  { href: '/suppliers', labelKey: 'nav_suppliers', hintKey: 'manage_suppliers_hint' },
  { href: '/dispatch', labelKey: 'nav_dispatch', hintKey: 'manage_dispatch_hint' },
  { href: '/audit-logs', labelKey: 'audit_logs', hintKey: 'manage_audit_hint' },
  { href: '/settings', labelKey: 'settings', hintKey: 'manage_settings_hint' },
] as const;

export default function ManagePage() {
  const t = useTranslations();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: () => apiFetch<Tenant[]>('/admin/tenants'),
  });

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('manage')} description={t('manage_description')} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {manageLinkKeys.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition-colors hover:border-[var(--sq-primary)]">
              <CardHeader>
                <CardTitle className="text-base">{t(link.labelKey)}</CardTitle>
                <CardDescription>{t(link.hintKey)}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex items-end justify-between gap-4">
        <h2 className="text-lg font-bold text-[var(--sq-text)]">{t('tenants')}</h2>
        <Kpi label={t('count')} value={String(data?.length ?? 0)} className="min-w-0" />
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}

      {data && data.length === 0 && (
        <EmptyState title={t('no_tenants')} description={t('no_tenants_desc')} />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data?.map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader>
              <CardTitle className="text-base">{tenant.nameAr ?? tenant.name}</CardTitle>
              <CardDescription>
                {tenant.mode} · {tenant.status}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 text-sm text-[var(--sq-text-secondary)]">
              <span>
                {tenant._count.users} {t('users_unit')}
              </span>
              <span>
                {tenant._count.orders} {t('orders_unit')}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Link href="/users">
        <Button variant="secondary">{t('manage_users_btn')}</Button>
      </Link>
    </div>
  );
}
