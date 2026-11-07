'use client';

import {
  Card,
  CardContent,
  EmptyState,
  PageHeader as UiPageHeader,
  Skeleton,
} from '@suqya/ui-kit';
import { useTranslations } from 'next-intl';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return <UiPageHeader title={title} description={description} actions={actions} />;
}

export function LoadingState({ rows = 3 }: { message?: string; rows?: number }) {
  const t = useTranslations();
  return (
    <div className="space-y-3" role="status" aria-label={t('loading')}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  const t = useTranslations();
  return (
    <Card>
      <CardContent>
        <EmptyState title={t('load_failed')} description={message} />
      </CardContent>
    </Card>
  );
}
