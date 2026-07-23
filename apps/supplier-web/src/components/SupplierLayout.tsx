'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Sun,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  Package,
  LogOut,
} from 'lucide-react';
import { Sidebar, Button } from '@suqya/ui-kit';
import { useAuth } from '@/providers/auth-provider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const navRoutes = [
  { href: '/', key: 'nav_today' as const, icon: Sun },
  { href: '/orders', key: 'nav_orders' as const, icon: ShoppingCart },
  { href: '/fleet', key: 'nav_fleet' as const, icon: Truck },
  { href: '/drivers', key: 'nav_drivers' as const, icon: Users },
  { href: '/settlements', key: 'nav_money' as const, icon: Wallet },
  { href: '/erp', key: 'nav_erp' as const, icon: Package },
];

function resolveActive(pathname: string) {
  if (pathname === '/') return '/';
  if (pathname.startsWith('/analytics')) return '/settlements';
  const match = navRoutes.find(
    (item) => item.href !== '/' && (pathname === item.href || pathname.startsWith(item.href + '/')),
  );
  return match?.href ?? pathname;
}

export function SupplierLayout({ children }: { children: React.ReactNode }) {
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
        brandSub={t('supplier_portal')}
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
