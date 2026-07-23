'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Radio,
  AlertTriangle,
  ShoppingCart,
  Wallet,
  Settings2,
  LogOut,
} from 'lucide-react';
import { Sidebar, Button } from '@suqya/ui-kit';
import { useAuth } from '@/providers/auth-provider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const navRoutes = [
  { href: '/', key: 'nav_live_ops_direct' as const, icon: Radio },
  { href: '/disputes', key: 'nav_exceptions' as const, icon: AlertTriangle },
  { href: '/orders', key: 'nav_orders' as const, icon: ShoppingCart },
  { href: '/settlements', key: 'nav_finance' as const, icon: Wallet },
  { href: '/tenants', key: 'manage' as const, icon: Settings2 },
];

function resolveActive(pathname: string) {
  if (pathname === '/') return '/';
  const match = navRoutes.find(
    (item) => item.href !== '/' && (pathname === item.href || pathname.startsWith(item.href + '/')),
  );
  if (match) return match.href;
  if (
    ['/credit-aging', '/coupons', '/analytics'].some((p) => pathname.startsWith(p))
  ) {
    return '/settlements';
  }
  if (
    ['/users', '/drivers', '/suppliers', '/settings', '/audit-logs', '/dispatch', '/support'].some(
      (p) => pathname.startsWith(p),
    )
  ) {
    return '/tenants';
  }
  return pathname;
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const { session, logout } = useAuth();
  const pathname = usePathname();

  const navItems = useMemo(
    () =>
      navRoutes.map(({ href, key, icon: Icon }) => ({
        href,
        label: t(key),
        icon: <Icon className="h-4 w-4" />,
      })),
    [t],
  );

  return (
    <div className="flex min-h-screen bg-[var(--sq-bg)]">
      <Sidebar
        brand={t('app_name')}
        brandSub={t('admin_command_center')}
        activeHref={resolveActive(pathname)}
        items={navItems}
        footer={
          <div className="space-y-2">
            <LanguageSwitcher />
            {session?.user && (
              <p className="truncate px-1 text-xs text-[var(--sq-text-secondary)]">
                {session.user.name ?? session.user.phone}
              </p>
            )}
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={logout}>
              <LogOut className="h-4 w-4" />
              {t('logout')}
            </Button>
          </div>
        }
      />
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
