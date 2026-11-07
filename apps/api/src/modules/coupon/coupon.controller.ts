import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

class CreateCouponDto {
  @ApiProperty() @IsString() code!: string;
  @ApiProperty({ enum: ['percent', 'fixed'] }) @IsEnum(['percent', 'fixed']) discountType!: 'percent' | 'fixed';
  @ApiProperty() @IsNumber() discountValue!: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxUses?: number;
}

@ApiTags('Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coupons')
export class CouponController {
  constructor(private couponService: CouponService) {}

  @Get()
  @Roles('admin', 'supplier')
  @ApiOperation({ summary: 'List coupons' })
  list(@CurrentUser() user: JwtPayload) {
    return this.couponService.list(user.tenantId);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create coupon' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCouponDto) {
    return this.couponService.create(user.tenantId, dto);
  }

  @Post('validate/:code')
  @Roles('customer')
  @ApiOperation({ summary: 'Validate coupon for order' })
  validate(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
    @Body('orderAmount') orderAmount: number,
  ) {
    return this.couponService.validate(user.tenantId, code, new Decimal(orderAmount));
  }
}
