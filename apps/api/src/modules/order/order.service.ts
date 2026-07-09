import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { OrderStateMachine } from './order-state-machine';
import { CreateOrderDto } from './order.dto';
import { DispatchService } from '../dispatch/dispatch.service';
import { Decimal } from '@prisma/client/runtime/library';

const VAT_RATE = 0.15;

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private stateMachine: OrderStateMachine,
    private dispatchService: DispatchService,
  ) {}

  async create(tenantId: string, customerId: string, dto: CreateOrderDto) {
    const [address, tankSize] = await Promise.all([
      this.prisma.address.findFirst({
        where: { id: dto.addressId, userId: customerId },
      }),
      this.prisma.tankSize.findFirst({
        where: { id: dto.tankSizeId, tenantId, isActive: true },
      }),
    ]);

    if (!address) throw new NotFoundException('Address not found');
    if (!tankSize) throw new NotFoundException('Tank size not found');

    if (dto.paymentType === 'credit') {
      const credit = await this.prisma.creditAccount.findUnique({
        where: { customerId },
      });
      if (!credit || credit.status !== 'approved') {
        throw new BadRequestException('Credit account not approved');
      }
    }

    const subtotal = await this.calculatePrice(tenantId, tankSize.id, address);
    const vatAmount = subtotal.mul(VAT_RATE);
    const totalAmount = subtotal.add(vatAmount);

    const orderCount = await this.prisma.order.count({ where: { tenantId } });
    const orderNumber = `SQ-${String(orderCount + 1).padStart(6, '0')}`;

    const order = await this.prisma.order.create({
      data: {
        tenantId,
        orderNumber,
        customerId,
        addressId: dto.addressId,
        tankSizeId: dto.tankSizeId,
        supplierId: dto.supplierId,
        paymentType: dto.paymentType,
        slaType: dto.slaType ?? 'standard',
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        notes: dto.notes,
        subtotal,
        vatAmount,
        totalAmount,
        status: 'pending',
        statusHistory: {
          create: { status: 'pending', actorId: customerId },
        },
      },
      include: {
        tankSize: true,
        address: true,
      },
    });

    await this.stateMachine.transition(this.prisma, order.id, 'supplier_review');

    if (dto.supplierId) {
      await this.dispatchService.assignDriver(tenantId, order.id);
    }

    return order;
  }

  async findByCustomer(customerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId },
        include: { tankSize: true, address: true, driver: { include: { user: { include: { profile: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { customerId } }),
    ]);
    return { data: orders, total, page, limit };
  }

  async findById(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: userId },
      include: {
        tankSize: true,
        address: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        proofOfDelivery: true,
        driver: { include: { user: { include: { profile: true } } } },
        supplier: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async track(orderId: string) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        trackingPoints: { orderBy: { recordedAt: 'desc' }, take: 50 },
        driver: true,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    return {
      orderId: order.id,
      status: order.status,
      driver: order.driver
        ? {
            id: order.driver.id,
            latitude: order.driver.latitude,
            longitude: order.driver.longitude,
          }
        : null,
      trackingPoints: order.trackingPoints,
      statusHistory: order.statusHistory,
    };
  }

  async cancel(orderId: string, userId: string, reason?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: userId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const cancellable: string[] = ['pending', 'supplier_review', 'dispatching', 'driver_offered'];
    if (!cancellable.includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    await this.stateMachine.transition(this.prisma, order.id, 'cancelled', userId, reason);
    return { message: 'Order cancelled' };
  }

  private async calculatePrice(
    tenantId: string,
    tankSizeId: string,
    address: { cityId: string | null },
  ): Promise<Decimal> {
    const rule = await this.prisma.pricingRule.findFirst({
      where: { tenantId, isActive: true },
      orderBy: { basePrice: 'asc' },
    });

    const basePrice = rule?.basePrice ?? new Decimal(150);
    return basePrice;
  }
}
