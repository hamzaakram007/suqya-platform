import * as React from 'react';
import { cn } from '../lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--sq-radius-sm)] bg-[var(--sq-border)]/60',
        className,
      )}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sq-primary-muted)] text-2xl text-[var(--sq-primary)]">
        ◌
      </div>
      <h3 className="text-xl font-bold text-[var(--sq-text)]">{title}</h3>
      <p className="max-w-sm text-sm text-[var(--sq-text-secondary)]">{description}</p>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[var(--sq-text)] md:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--sq-text-secondary)]">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export function MapShell({
  children,
  overlay,
  className,
}: {
  children?: React.ReactNode;
  overlay?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative min-h-[320px] overflow-hidden rounded-[var(--sq-radius-xl)] border border-[var(--sq-border)] bg-[linear-gradient(160deg,var(--sq-primary-muted),var(--sq-bg)_45%,#dfeaea)]',
        className,
      )}
    >
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,var(--sq-border)_1px,transparent_0)] [background-size:24px_24px]" />
      {children}
      {overlay ? (
        <div className="absolute inset-x-4 bottom-4 z-10 md:inset-s-4 md:end-auto md:w-80">
          {overlay}
        </div>
      ) : null}
    </div>
  );
}
