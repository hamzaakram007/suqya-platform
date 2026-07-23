import { Controller, Get, Query, UseGuards, Headers } from '@nestjs/common';
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

  @Get('users')
  @ApiOperation({ summary: 'List users' })
  users(
    @CurrentUser() user: JwtPayload,
    @Query('role') role?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const take = limit ?? 20;
    const skip = ((page ?? 1) - 1) * take;
    const where = {
      tenantId: user.tenantId,
      ...(role ? { role: role as never } : {}),
    };
    return Promise.all([
      this.prisma.user.findMany({
        where,
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.user.count({ where }),
    ]).then(([data, total]) => ({ data, meta: { page: page ?? 1, limit: take, total } }));
  }

  @Get('orders')
  @ApiOperation({ summary: 'List all orders' })
  orders(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const take = limit ?? 20;
    const skip = ((page ?? 1) - 1) * take;
    const where = {
      tenantId: user.tenantId,
      ...(status ? { status: status as never } : {}),
    };
    return Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: { include: { profile: true } },
          supplier: true,
          driver: { include: { user: { include: { profile: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]).then(([data, total]) => ({ data, meta: { page: page ?? 1, limit: take, total } }));
  }

  @Get('drivers')
  @ApiOperation({ summary: 'List drivers' })
  drivers(@CurrentUser() user: JwtPayload) {
    return this.prisma.driver.findMany({
      where: { tenantId: user.tenantId },
      include: {
        user: { include: { profile: true } },
        truck: true,
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'List suppliers' })
  suppliers(@CurrentUser() user: JwtPayload) {
    return this.prisma.supplier.findMany({
      where: { tenantId: user.tenantId },
      include: {
        user: { include: { profile: true } },
        _count: { select: { drivers: true, trucks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('search')
  @ApiOperation({
    summary: 'Locale-aware search across tenants, users, suppliers, tank sizes',
  })
  async search(
    @CurrentUser() user: JwtPayload,
    @Query('q') q: string,
    @Query('locale') localeQuery?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const term = (q ?? '').trim();
    if (!term || term.length < 2) {
      return { tenants: [], users: [], suppliers: [], tankSizes: [], coupons: [] };
    }

    const locale =
      localeQuery === 'en' || localeQuery === 'ar'
        ? localeQuery
        : acceptLanguage?.toLowerCase().startsWith('en')
          ? 'en'
          : 'ar';

    const dual = true; // ops dual-field search
    const nameFilter =
      locale === 'en'
        ? {
            OR: [
              { nameEn: { contains: term, mode: 'insensitive' as const } },
              ...(dual
                ? [{ nameAr: { contains: term, mode: 'insensitive' as const } }]
                : []),
            ],
          }
        : {
            OR: [
              { nameAr: { contains: term, mode: 'insensitive' as const } },
              ...(dual
                ? [{ nameEn: { contains: term, mode: 'insensitive' as const } }]
                : []),
            ],
          };

    const [tenants, users, suppliers, tankSizes, coupons] = await Promise.all([
      this.prisma.tenant.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { nameAr: { contains: term, mode: 'insensitive' } },
            { nameEn: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.user.findMany({
        where: {
          tenantId: user.tenantId,
          OR: [
            { phone: { contains: term } },
            { profile: { nameAr: { contains: term, mode: 'insensitive' } } },
            { profile: { nameEn: { contains: term, mode: 'insensitive' } } },
          ],
        },
        include: { profile: true },
        take: 10,
      }),
      this.prisma.supplier.findMany({
        where: {
          tenantId: user.tenantId,
          companyName: { contains: term, mode: 'insensitive' },
        },
        take: 10,
      }),
      this.prisma.tankSize.findMany({
        where: { tenantId: user.tenantId, ...nameFilter },
        take: 10,
      }),
      this.prisma.coupon.findMany({
        where: {
          tenantId: user.tenantId,
          OR: [
            { code: { contains: term, mode: 'insensitive' } },
            { titleAr: { contains: term, mode: 'insensitive' } },
            { titleEn: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
    ]);

    return { locale, tenants, users, suppliers, tankSizes, coupons };
  }
}
