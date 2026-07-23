import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(tenantId: string) {
    const [
      totalOrders,
      completedOrders,
      activeDrivers,
      activeSuppliers,
      revenueAgg,
    ] = await Promise.all([
      this.prisma.order.count({ where: { tenantId } }),
      this.prisma.order.count({ where: { tenantId, status: 'completed' } }),
      this.prisma.driver.count({ where: { tenantId, isOnline: true } }),
      this.prisma.supplier.count({ where: { tenantId, status: 'active' } }),
      this.prisma.order.aggregate({
        where: { tenantId, status: 'completed' },
        _sum: { totalAmount: true },
      }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.totalAmount ?? 0);
    const completionRate =
      totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 1000) / 10 : 0;

    return {
      totalOrders,
      completedOrders,
      activeDrivers,
      activeSuppliers,
      totalRevenue,
      completionRate,
    };
  }

  async getOrderTrends(tenantId: string, days = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const orders = await this.prisma.order.findMany({
      where: { tenantId, createdAt: { gte: since } },
      select: { createdAt: true, status: true, totalAmount: true },
    });

    const byDay: Record<string, { count: number; revenue: number }> = {};
    for (const o of orders) {
      const day = o.createdAt.toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = { count: 0, revenue: 0 };
      byDay[day].count++;
      if (o.status === 'completed') byDay[day].revenue += Number(o.totalAmount);
    }

    return Object.entries(byDay).map(([date, stats]) => ({ date, ...stats }));
  }

  async exportOrders(tenantId: string, from: Date, to: Date) {
    return this.prisma.order.findMany({
      where: { tenantId, createdAt: { gte: from, lte: to } },
      include: {
        customer: { include: { profile: true } },
        tankSize: true,
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
