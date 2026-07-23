import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ErpService } from './erp.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.module';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class FuelDto {
  @ApiPropertyOptional() @IsOptional() @IsString() truckId?: string;
  @ApiProperty() @IsNumber() liters!: number;
  @ApiProperty() @IsNumber() cost!: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() odometer?: number;
}

@ApiTags('ERP')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('supplier', 'admin')
@Controller('erp')
export class ErpController {
  constructor(
    private erpService: ErpService,
    private prisma: PrismaService,
  ) {}

  private async getSupplierId(user: JwtPayload) {
    if (user.role === 'admin') return null;
    const supplier = await this.prisma.supplier.findUniqueOrThrow({
      where: { userId: user.sub },
    });
    return supplier.id;
  }

  @Post('fuel')
  @ApiOperation({ summary: 'Record fuel expense' })
  async fuel(@CurrentUser() user: JwtPayload, @Body() dto: FuelDto) {
    const supplierId = await this.getSupplierId(user);
    if (!supplierId) throw new Error('Supplier context required');
    return this.erpService.recordFuelExpense(user.tenantId, supplierId, dto);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'List inventory items' })
  async inventory(@CurrentUser() user: JwtPayload) {
    const supplierId = await this.getSupplierId(user);
    if (!supplierId) return [];
    return this.erpService.listInventory(user.tenantId, supplierId);
  }

  @Get('employees')
  @ApiOperation({ summary: 'List employees' })
  async employees(@CurrentUser() user: JwtPayload) {
    const supplierId = await this.getSupplierId(user);
    if (!supplierId) return [];
    return this.erpService.listEmployees(user.tenantId, supplierId);
  }
}
