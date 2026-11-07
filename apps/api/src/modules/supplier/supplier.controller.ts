import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { DispatchService } from '../dispatch/dispatch.service';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('supplier')
@Controller('suppliers')
export class SupplierController {
  constructor(
    private prisma: PrismaService,
    private dispatch: DispatchService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Supplier dashboard KPIs' })
  async dashboard(@CurrentUser() user: JwtPayload) {
    const supplier = await this.prisma.supplier.findUniqueOrThrow({
      where: { userId: user.sub },
    });

    const [pendingOrders, completedToday, revenue, drivers] = await Promise.all([
      this.prisma.order.count({
        where: { supplierId: supplier.id, status: 'supplier_review' },
      }),
      this.prisma.order.count({
        where: {
          supplierId: supplier.id,
          status: 'completed',
          completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.order.aggregate({
        where: { supplierId: supplier.id, status: 'completed' },
        _sum: { totalAmount: true },
      }),
      this.prisma.driver.count({ where: { supplierId: supplier.id, isOnline: true } }),
    ]);

    return {
      pendingOrders,
      completedToday,
      totalRevenue: revenue._sum.totalAmount ?? 0,
      onlineDrivers: drivers,
    };
  }

  @Post('orders/:id/accept')
  @ApiOperation({ summary: 'Accept incoming order' })
  async acceptOrder(@CurrentUser() user: JwtPayload, @Param('id') orderId: string) {
    const supplier = await this.prisma.supplier.findUniqueOrThrow({
      where: { userId: user.sub },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { supplierId: supplier.id, status: 'dispatching' },
    });

    return this.dispatch.assignDriver(user.tenantId, orderId);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List supplier orders' })
  async orders(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
  ) {
    const supplier = await this.prisma.supplier.findUniqueOrThrow({
      where: { userId: user.sub },
    });
    return this.prisma.order.findMany({
      where: {
        supplierId: supplier.id,
        ...(status ? { status: status as never } : {}),
      },
      include: {
        customer: { include: { profile: true } },
        driver: { include: { user: { include: { profile: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('fleet')
  @ApiOperation({ summary: 'List fleet trucks and drivers' })
  async fleet(@CurrentUser() user: JwtPayload) {
    const supplier = await this.prisma.supplier.findUniqueOrThrow({
      where: { userId: user.sub },
    });

    const [trucks, drivers] = await Promise.all([
      this.prisma.truck.findMany({ where: { supplierId: supplier.id } }),
      this.prisma.driver.findMany({
        where: { supplierId: supplier.id },
        include: { user: { include: { profile: true } }, truck: true },
      }),
    ]);

    return { trucks, drivers };
  }
}
