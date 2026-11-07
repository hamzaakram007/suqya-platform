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

interface Dispute {
  id: string;
  orderId: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
}

export default function ExceptionsPage() {
  const t = useTranslations();
  const { locale } = useLocaleContext();
  const disputes = useQuery({
    queryKey: ['disputes'],
    queryFn: () => apiFetch<Dispute[]>('/disputes'),
  });
  const tickets = useQuery({
    queryKey: ['support', 'tickets'],
    queryFn: () => apiFetch<Ticket[]>('/support/tickets'),
  });

  const dateLocale = locale === 'ar' ? 'ar-SA' : 'en-US';
  const openDisputes = disputes.data ?? [];
  const openTickets = tickets.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t('nav_exceptions')}
        description={t('exceptions_description')}
        actions={
          <Link href="/support">
            <Button variant="secondary">{t('support_tickets')}</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Kpi label={t('disputes_kpi')} value={String(openDisputes.length)} />
        <Kpi label={t('tickets_kpi')} value={String(openTickets.length)} />
      </div>

      {(disputes.isLoading || tickets.isLoading) && <LoadingState rows={3} />}
      {(disputes.error || tickets.error) && (
        <ErrorState message={(disputes.error ?? tickets.error)!.message} />
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--sq-text)]">{t('nav_disputes')}</h2>
        {disputes.data && openDisputes.length === 0 && (
          <EmptyState title={t('no_disputes')} description={t('no_disputes_desc')} />
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {openDisputes.map((d) => (
            <Card key={d.id} selected={d.status !== 'resolved'}>
              <CardHeader>
                <CardTitle className="text-base">{d.reason}</CardTitle>
                <CardDescription>
                  {t('order_prefix')} {d.orderId.slice(0, 8)}… · {d.status}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-[var(--sq-text-secondary)]">
                  {new Date(d.createdAt).toLocaleString(dateLocale)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
