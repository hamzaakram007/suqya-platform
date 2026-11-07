import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SettlementService } from './settlement.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.module';

@ApiTags('Settlements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settlements')
export class SettlementController {
  constructor(
    private settlementService: SettlementService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @Roles('supplier', 'admin')
  @ApiOperation({ summary: 'List settlements' })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (user.role === 'admin') {
      const skip = ((page ?? 1) - 1) * (limit ?? 20);
      const [data, total] = await Promise.all([
        this.prisma.settlement.findMany({
          where: { tenantId: user.tenantId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit ?? 20,
        }),
        this.prisma.settlement.count({ where: { tenantId: user.tenantId } }),
      ]);
      return { data, meta: { page: page ?? 1, limit: limit ?? 20, total } };
    }

    const supplier = await this.prisma.supplier.findUniqueOrThrow({
      where: { userId: user.sub },
    });
    return this.settlementService.listBySupplier(supplier.id, page, limit);
  }

  @Patch(':id/pay')
  @Roles('admin')
  @ApiOperation({ summary: 'Mark settlement as paid' })
  pay(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.settlementService.markPaid(id, user.tenantId);
  }
}
