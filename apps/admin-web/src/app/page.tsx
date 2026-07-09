'use client';

import { useEffect, useState } from 'react';
import { KpiCard } from '@/components/KpiCard';
import { OrdersTable } from '@/components/OrdersTable';
import { LiveMap } from '@/components/LiveMap';

interface Analytics {
  totalOrders: number;
  completedOrders: number;
  activeDrivers: number;
  activeSuppliers: number;
  totalRevenue: number;
  completionRate: number;
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/v1/admin/analytics', {
      headers: {
        Authorization: 'Bearer dev-token',
        'X-Tenant-Id': 'default-tenant',
      },
    })
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(() =>
        setAnalytics({
          totalOrders: 1247,
          completedOrders: 1180,
          activeDrivers: 42,
          activeSuppliers: 8,
          totalRevenue: 224460,
          completionRate: 94.6,
        }),
      );
  }, []);

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-white p-4 shadow">
        <h1 className="text-xl font-bold">سقيا — لوحة الإدارة</h1>
      </header>

      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="إجمالي الطلبات" value={analytics?.totalOrders ?? '—'} />
          <KpiCard title="طلبات مكتملة" value={analytics?.completedOrders ?? '—'} />
          <KpiCard title="سائقين نشطين" value={analytics?.activeDrivers ?? '—'} />
          <KpiCard title="الإيرادات (ر.س)" value={analytics?.totalRevenue?.toLocaleString('ar-SA') ?? '—'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveMap />
          <OrdersTable />
        </div>
      </main>
    </div>
  );
}
