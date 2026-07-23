import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';

@Injectable()
export class DisputeService {
  constructor(private prisma: PrismaService) {}

  async create(orderId: string, userId: string, reason: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: userId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!['delivered', 'payment_pending', 'completed', 'disputed'].includes(order.status)) {
      throw new ForbiddenException('Order cannot be disputed at this stage');
    }

    return this.prisma.orderDispute.upsert({
      where: { orderId },
      create: { orderId, raisedBy: userId, reason, status: 'open' },
      update: { reason, status: 'open' },
    });
  }

  async resolve(disputeId: string, tenantId: string, resolution: string) {
    const dispute = await this.prisma.orderDispute.findFirst({
      where: { id: disputeId, order: { tenantId } },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    return this.prisma.orderDispute.update({
      where: { id: disputeId },
      data: { status: 'resolved', resolution },
    });
  }

  async list(tenantId: string, status?: string) {
    return this.prisma.orderDispute.findMany({
      where: {
        order: { tenantId },
        ...(status && { status }),
      },
      include: { order: { select: { orderNumber: true, customerId: true } } },
      orderBy: { id: 'desc' },
    });
  }
}
