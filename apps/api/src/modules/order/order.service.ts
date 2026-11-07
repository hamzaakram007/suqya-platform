import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { CreateOrderDto } from './order.dto';
import { OrderStateMachine } from './order-state-machine';
import { DispatchService } from '../dispatch/dispatch.service';
import { CreditService } from '../credit/credit.service';
import { Decimal } from '@prisma/client/runtime/library';

const VAT_RATE = 0.15;

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private stateMachine: OrderStateMachine,
    private dispatchService: DispatchService,
    private creditService: CreditService,
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

    const subtotal = await this.calculatePrice(tenantId, tankSize.id, address);
    const vatAmount = subtotal.mul(VAT_RATE);
    const totalAmount = subtotal.add(vatAmount);

    if (dto.paymentType === 'credit') {
      await this.creditService.assertCreditAvailable(customerId, totalAmount);
    }

    const orderNumber = await this.generateOrderNumber(tenantId);

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
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
        include: { tankSize: true, address: true },
      });

      if (dto.paymentType === 'credit') {
        await this.creditService.chargeOnOrder(
          customerId,
          created.id,
          totalAmount,
          tx,
        );
      }

      return created;
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
        include: {
          tankSize: true,
          address: true,
          driver: { include: { user: { include: { profile: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { customerId } }),
    ]);
    return { data: orders, meta: { page, limit, total, hasNext: skip + limit < total } };
  }

  async findById(orderId: string, user: JwtPayload) {
    const order = await this.findOrderWithAccess(orderId, user);
    return this.prisma.order.findFirstOrThrow({
      where: { id: order.id },
      include: {
        tankSize: true,
        address: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        proofOfDelivery: true,
        driver: { include: { user: { include: { profile: true } } } },
        supplier: true,
      },
    });
  }

  async track(orderId: string, user: JwtPayload) {
    await this.findOrderWithAccess(orderId, user);

    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: {
        trackingPoints: { orderBy: { recordedAt: 'desc' }, take: 50 },
        driver: true,
        address: true,
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
      address: order.address
        ? {
            id: order.address.id,
            latitude: order.address.latitude,
            longitude: order.address.longitude,
            street: order.address.street,
          }
        : null,
      trackingPoints: order.trackingPoints,
      statusHistory: order.statusHistory,
      socket: {
        namespace: '/tracking',
        events: {
          subscribe: 'subscribe_order',
          location: 'location_update',
          driverEmit: 'driver_location',
        },
      },
    };
  }

  async cancel(orderId: string, userId: string, reason?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: userId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const cancellable: string[] = [
      'pending',
      'supplier_review',
      'dispatching',
      'driver_offered',
    ];
    if (!cancellable.includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    await this.stateMachine.transition(
      this.prisma,
      order.id,
      'cancelled',
      userId,
      reason,
    );

    if (order.paymentType === 'credit') {
      await this.creditService.reverseCharge(order.customerId, orderId);
    }

    return { message: 'Order cancelled' };
  }

  private async findOrderWithAccess(orderId: string, user: JwtPayload) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId: user.tenantId },
      include: { driver: true, supplier: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    const isCustomer = order.customerId === user.sub;
    const isDriver = order.driver?.userId === user.sub;
    const isSupplier = order.supplier?.userId === user.sub;
    const isStaff = ['admin', 'dispatcher'].includes(user.role);

    if (!isCustomer && !isDriver && !isSupplier && !isStaff) {
      throw new ForbiddenException('Access denied to this order');
    }

    return order;
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const result = await this.prisma.$queryRaw<[{ nextval: bigint }]>`
      SELECT nextval('order_number_seq') as nextval
    `.catch(async () => {
      const count = await this.prisma.order.count({ where: { tenantId } });
      return [{ nextval: BigInt(count + 1) }];
    });

    const seq = Number(result[0].nextval);
    return `SQ-${String(seq).padStart(6, '0')}`;
  }

  private async calculatePrice(
    tenantId: string,
    _tankSizeId: string,
    _address: { cityId: string | null },
  ): Promise<Decimal> {
    const rule = await this.prisma.pricingRule.findFirst({
      where: { tenantId, isActive: true },
      orderBy: { basePrice: 'asc' },
    });

    return rule?.basePrice ?? new Decimal(150);
  }
}
