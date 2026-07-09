import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { OrderStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['supplier_review', 'cancelled'],
  supplier_review: ['dispatching', 'cancelled'],
  dispatching: ['driver_offered', 'cancelled'],
  driver_offered: ['accepted', 'dispatching', 'cancelled'],
  accepted: ['filling', 'cancelled'],
  filling: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: ['payment_pending'],
  payment_pending: ['completed', 'disputed'],
  completed: [],
  cancelled: [],
  disputed: ['completed', 'cancelled'],
};

@Injectable()
export class OrderStateMachine {
  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  async transition(
    prisma: PrismaService,
    orderId: string,
    toStatus: OrderStatus,
    actorId?: string,
    notes?: string,
  ) {
    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });

    if (!this.canTransition(order.status, toStatus)) {
      throw new Error(
        `Invalid transition from ${order.status} to ${toStatus}`,
      );
    }

    return prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: toStatus,
          completedAt: toStatus === 'completed' ? new Date() : undefined,
        },
      }),
      prisma.orderStatusHistory.create({
        data: { orderId, status: toStatus, actorId, notes },
      }),
    ]);
  }
}
