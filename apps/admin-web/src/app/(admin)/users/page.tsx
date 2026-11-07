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

interface UserRow {
  id: string;
  phone: string;
  role: string;
  status: string;
  profile?: { nameAr?: string; nameEn?: string };
}

interface UsersResponse {
  data: UserRow[];
  meta: { total: number };
}

export default function UsersPage() {
  const t = useTranslations();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiFetch<UsersResponse>('/admin/users'),
  });

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t('nav_users')}
        description={`${data?.meta.total ?? 0} ${t('users_description')}`}
      />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && data.data.length === 0 && (
        <EmptyState title={t('no_users')} description={t('no_users_desc')} />
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data?.data.map((u) => (
          <Card key={u.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {u.profile?.nameAr ?? u.profile?.nameEn ?? '—'}
              </CardTitle>
              <CardDescription>
                {u.role} · {u.status}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--sq-text-secondary)]" dir="ltr">
                {u.phone}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
