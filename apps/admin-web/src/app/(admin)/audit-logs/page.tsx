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
import { useLocaleContext } from '@/providers/locale-provider';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  userId?: string;
}

export default function AuditLogsPage() {
  const t = useTranslations();
  const { locale } = useLocaleContext();
  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => apiFetch<AuditLog[]>('/security/audit-logs'),
  });

  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('audit_logs')} description={t('audit_description')} />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && data.length === 0 && (
        <EmptyState title={t('no_audit_logs')} description={t('no_audit_logs_desc')} />
      )}
      <div className="space-y-3">
        {data?.map((l) => (
          <Card key={l.id}>
            <CardHeader className="mb-1">
              <CardTitle className="text-base">{l.action}</CardTitle>
              <CardDescription>
                {l.entityType} · {l.entityId.slice(0, 8)}…
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--sq-text-secondary)]">
                {new Date(l.createdAt).toLocaleString(dateLocale)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
