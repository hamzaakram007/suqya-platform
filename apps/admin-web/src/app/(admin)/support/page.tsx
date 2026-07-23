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

interface Ticket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
}

export default function SupportPage() {
  const t = useTranslations();
  const { locale } = useLocaleContext();
  const { data, isLoading, error } = useQuery({
    queryKey: ['support', 'tickets'],
    queryFn: () => apiFetch<Ticket[]>('/support/tickets'),
  });

  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';

  return (
    <div className="space-y-6 p-6">
      <PageHeader title={t('support_tickets')} description={t('support_tickets_desc')} />
      <Kpi label={t('tickets_kpi')} value={String(data?.length ?? 0)} />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && data.length === 0 && (
        <EmptyState title={t('empty_inbox')} description={t('no_open_tickets')} />
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {data?.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <CardTitle className="text-base">{ticket.subject}</CardTitle>
              <CardDescription>{ticket.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--sq-text-secondary)]">
                {new Date(ticket.createdAt).toLocaleDateString(dateLocale)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
