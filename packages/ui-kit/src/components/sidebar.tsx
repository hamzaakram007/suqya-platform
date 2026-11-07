'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '../lib/utils';

export type SidebarItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
};

export type SidebarProps = {
  items: SidebarItem[];
  activeHref?: string;
  brand?: string;
  brandSub?: string;
  footer?: React.ReactNode;
  className?: string;
};

/** Compact command rail — not a dense CRUD sidebar. */
export function Sidebar({
  items,
  activeHref,
  brand = 'سقيا',
  brandSub,
  footer,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-[260px] flex-col border-e border-[var(--sq-border)] bg-[var(--sq-surface)]',
        className,
      )}
    >
      <div className="border-b border-[var(--sq-border)] px-5 py-6">
        <p className="text-2xl font-bold tracking-tight text-[var(--sq-primary)]">{brand}</p>
        {brandSub ? (
          <p className="mt-1 text-sm text-[var(--sq-text-secondary)]">{brandSub}</p>
        ) : null}
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const active = activeHref === item.href || activeHref?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-[var(--sq-radius-md)] px-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-[var(--sq-primary-muted)] text-[var(--sq-primary)]'
                  : 'text-[var(--sq-text-secondary)] hover:bg-[var(--sq-bg)] hover:text-[var(--sq-text)]',
              )}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-[var(--sq-accent-muted)] px-2 py-0.5 text-xs text-[var(--sq-accent)]">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      {footer ? <div className="border-t border-[var(--sq-border)] p-4">{footer}</div> : null}
    </aside>
  );
}
