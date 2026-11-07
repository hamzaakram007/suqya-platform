import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';
import { Order } from '@prisma/client';

@Injectable()
export class SettlementService {
  constructor(private prisma: PrismaService) {}

  private getPeriodBounds(date: Date) {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { periodStart: start, periodEnd: end };
  }

  async createFromOrder(order: Order) {
    if (!order.supplierId) return null;

    const completedAt = order.completedAt ?? new Date();
    const { periodStart, periodEnd } = this.getPeriodBounds(completedAt);

    const existing = await this.prisma.settlement.findFirst({
      where: {
        supplierId: order.supplierId,
        periodStart,
        periodEnd,
        status: 'pending',
      },
    });

    const commissionRate = new Decimal(0.1);
    const commission = order.subtotal.mul(commissionRate);
    const netAmount = order.subtotal.sub(commission);

    if (existing) {
      return this.prisma.settlement.update({
        where: { id: existing.id },
        data: {
          grossAmount: existing.grossAmount.add(order.subtotal),
          commission: existing.commission.add(commission),
          netAmount: existing.netAmount.add(netAmount),
        },
      });
    }

    return this.prisma.settlement.create({
      data: {
        tenantId: order.tenantId,
        supplierId: order.supplierId,
        periodStart,
        periodEnd,
        grossAmount: order.subtotal,
        commission,
        netAmount,
        status: 'pending',
      },
    });
  }

  async listBySupplier(supplierId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.settlement.findMany({
        where: { supplierId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.settlement.count({ where: { supplierId } }),
    ]);
    return { data, meta: { page, limit, total, hasNext: skip + limit < total } };
  }

  async markPaid(settlementId: string, tenantId: string) {
    return this.prisma.settlement.update({
      where: { id: settlementId, tenantId },
      data: { status: 'paid', paidAt: new Date() },
    });
  }
}
