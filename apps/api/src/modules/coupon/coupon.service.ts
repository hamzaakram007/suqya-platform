import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    data: {
      code: string;
      discountType: 'percent' | 'fixed';
      discountValue: number;
      maxUses?: number;
      expiresAt?: Date;
    },
  ) {
    return this.prisma.coupon.create({
      data: {
        tenantId,
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: new Decimal(data.discountValue),
        maxUses: data.maxUses,
        expiresAt: data.expiresAt,
      },
    });
  }

  async validate(tenantId: string, code: string, orderAmount: Decimal) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { tenantId, code: code.toUpperCase(), isActive: true },
    });

    if (!coupon) throw new BadRequestException('Invalid coupon');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('Coupon expired');
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    const discount =
      coupon.discountType === 'percent'
        ? orderAmount.mul(coupon.discountValue).div(100)
        : coupon.discountValue;

    return { coupon, discount: Decimal.min(discount, orderAmount) };
  }

  async redeem(couponId: string) {
    return this.prisma.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    });
  }

  async list(tenantId: string) {
    return this.prisma.coupon.findMany({
      where: { tenantId },
      orderBy: { code: 'asc' },
    });
  }
}
