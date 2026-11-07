import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async listPlans(tenantId: string) {
    return this.prisma.subscriptionPlan.findMany({
      where: { tenantId, isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });
  }

  async subscribe(userId: string, tenantId: string, planId: string) {
    const plan = await this.prisma.subscriptionPlan.findFirstOrThrow({
      where: { id: planId, tenantId },
    });

    return this.prisma.userSubscription.create({
      data: {
        userId,
        planId: plan.id,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      },
    });
  }

  async getActive(userId: string) {
    return this.prisma.userSubscription.findFirst({
      where: { userId, status: 'active' },
      include: { plan: true },
    });
  }
}

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  async awardPoints(userId: string, points: number, type: string, referenceId?: string) {
    return this.prisma.loyaltyPoint.create({
      data: { userId, points, type, referenceId },
    });
  }

  async getBalance(userId: string) {
    const points = await this.prisma.loyaltyPoint.aggregate({
      where: { userId },
      _sum: { points: true },
    });
    return { balance: points._sum.points ?? 0 };
  }

  async createReferral(referrerId: string, referredPhone: string) {
    return this.prisma.referral.create({
      data: { referrerId, referredPhone, status: 'pending' },
    });
  }
}
