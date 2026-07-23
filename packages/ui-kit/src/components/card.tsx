import * as React from 'react';
import { cn } from '../lib/utils';

export function Card({
  className,
  selected,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { selected?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-[var(--sq-radius-lg)] border bg-[var(--sq-surface)] p-4 shadow-[var(--sq-shadow-sm)] transition-colors',
        selected
          ? 'border-[var(--sq-primary)] border-2'
          : 'border-[var(--sq-border)]',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-3 flex flex-col gap-1', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-bold text-[var(--sq-text)]', className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-[var(--sq-text-secondary)]', className)} {...props} />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props} />;
}

export function Kpi({
  label,
  value,
  delta,
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  className?: string;
}) {
  return (
    <Card className={cn('min-w-[140px]', className)}>
      <p className="text-sm text-[var(--sq-text-secondary)]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--sq-text)]">{value}</p>
      {delta ? <p className="mt-1 text-xs text-[var(--sq-success)]">{delta}</p> : null}
    </Card>
  );
}
