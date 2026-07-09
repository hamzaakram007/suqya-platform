import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Platform analytics dashboard' })
  async analytics(@CurrentUser() user: JwtPayload) {
    const tenantId = user.tenantId;
    const [totalOrders, completedOrders, activeDrivers, activeSuppliers, revenue] =
      await Promise.all([
        this.prisma.order.count({ where: { tenantId } }),
        this.prisma.order.count({ where: { tenantId, status: 'completed' } }),
        this.prisma.driver.count({ where: { tenantId, isOnline: true } }),
        this.prisma.supplier.count({ where: { tenantId, status: 'active' } }),
        this.prisma.order.aggregate({
          where: { tenantId, status: 'completed' },
          _sum: { totalAmount: true },
        }),
      ]);

    return {
      totalOrders,
      completedOrders,
      activeDrivers,
      activeSuppliers,
      totalRevenue: revenue._sum.totalAmount ?? 0,
      completionRate: totalOrders ? (completedOrders / totalOrders) * 100 : 0,
    };
  }

  @Get('tenants')
  @ApiOperation({ summary: 'List all tenants' })
  tenants() {
    return this.prisma.tenant.findMany({
      include: { _count: { select: { users: true, orders: true } } },
    });
  }
}
