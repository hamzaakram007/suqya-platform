import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { AppLocale } from '../../common/locale/locale.types';
import { OrderStatus } from '@prisma/client';

const ACTIVE: OrderStatus[] = [
  'pending',
  'supplier_review',
  'dispatching',
  'driver_offered',
  'accepted',
  'filling',
  'in_transit',
  'payment_pending',
];

@Injectable()
export class OpsAlertsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Rule-based ops alerts (no ML): delayed deliveries + overloaded suppliers.
   * Copy returned in requested locale.
   */
  async getAlerts(tenantId: string, locale: AppLocale) {
    const now = Date.now();
    const delayMs = 90 * 60 * 1000;
    const overloadThreshold = 8;

    const activeOrders = await this.prisma.order.findMany({
      where: { tenantId, status: { in: ACTIVE } },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        supplierId: true,
        supplier: { select: { id: true, companyName: true } },
      },
      take: 200,
    });

    const delayed = activeOrders
      .filter((o) => now - o.createdAt.getTime() > delayMs)
      .map((o) => ({
        type: 'delayed_delivery' as const,
        orderId: o.id,
        orderNumber: o.orderNumber,
        minutesOver: Math.round((now - o.createdAt.getTime() - delayMs) / 60000),
        message:
          locale === 'en'
            ? `Order ${o.orderNumber} exceeded expected delivery time`
            : `الطلب ${o.orderNumber} تجاوز الوقت المتوقع للتوصيل`,
      }));

    const bySupplier = new Map<string, { name: string; count: number }>();
    for (const o of activeOrders) {
      if (!o.supplierId) continue;
      const cur = bySupplier.get(o.supplierId) ?? {
        name: o.supplier?.companyName ?? o.supplierId,
        count: 0,
      };
      cur.count += 1;
      bySupplier.set(o.supplierId, cur);
    }

    const overloaded = [...bySupplier.entries()]
      .filter(([, v]) => v.count >= overloadThreshold)
      .map(([supplierId, v]) => ({
        type: 'overloaded_supplier' as const,
        supplierId,
        activeJobs: v.count,
        message:
          locale === 'en'
            ? `Supplier ${v.name} has ${v.count} active jobs (overload)`
            : `المورد ${v.name} لديه ${v.count} مهام نشطة (ازدحام)`,
      }));

    const offlineDrivers = await this.prisma.driver.count({
      where: { tenantId, status: 'active', isOnline: false },
    });

    const offlineAlert =
      offlineDrivers > 5
        ? [
            {
              type: 'offline_drivers' as const,
              count: offlineDrivers,
              message:
                locale === 'en'
                  ? `${offlineDrivers} active drivers are offline`
                  : `${offlineDrivers} سائقون نشطون غير متصلين`,
            },
          ]
        : [];

    return {
      generatedAt: new Date().toISOString(),
      locale,
      alerts: [...delayed, ...overloaded, ...offlineAlert],
      summary: {
        delayedCount: delayed.length,
        overloadedCount: overloaded.length,
        offlineDrivers,
      },
    };
  }
}
