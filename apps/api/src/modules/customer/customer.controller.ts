import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { Locale } from '../../common/decorators/locale.decorator';
import { AppLocale } from '../../common/locale/locale.types';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateAddressDto {
  @ApiPropertyOptional() @IsOptional() @IsString() label?: string;
  @ApiProperty() @IsString() buildingNumber!: string;
  @ApiProperty() @IsString() street!: string;
  @ApiProperty() @IsNumber() latitude!: number;
  @ApiProperty() @IsNumber() longitude!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() instructions?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDefault?: boolean;
}

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
@Controller('customers')
export class CustomerController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get customer profile' })
  async profile(@CurrentUser() user: JwtPayload) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: user.sub },
      include: { profile: true, addresses: true, creditAccount: true, wallet: true },
    });
  }

  @Get('me/orders')
  @ApiOperation({ summary: 'Get customer orders' })
  orders(@CurrentUser() user: JwtPayload) {
    return this.prisma.order.findMany({
      where: { customerId: user.sub },
      include: { tankSize: true, address: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  @Get('me/credit')
  @ApiOperation({ summary: 'Get credit account summary' })
  credit(@CurrentUser() user: JwtPayload) {
    return this.prisma.creditAccount.findUnique({
      where: { customerId: user.sub },
    });
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add delivery address' })
  async addAddress(@CurrentUser() user: JwtPayload, @Body() dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId: user.sub },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({
      data: { userId: user.sub, ...dto },
    });
  }

  @Get('me/order-defaults')
  @ApiOperation({ summary: 'Get remembered 3-tap order defaults' })
  async orderDefaults(@CurrentUser() user: JwtPayload) {
    const [address, lastOrder, profile] = await Promise.all([
      this.prisma.address.findFirst({
        where: { userId: user.sub, isDefault: true },
      }),
      this.prisma.order.findFirst({
        where: { customerId: user.sub, status: { not: 'cancelled' } },
        orderBy: { createdAt: 'desc' },
        include: { tankSize: true },
      }),
      this.prisma.userProfile.findUnique({ where: { userId: user.sub } }),
    ]);

    return {
      addressId: address?.id ?? lastOrder?.addressId ?? null,
      address,
      tankSizeId: lastOrder?.tankSizeId ?? null,
      tankSize: lastOrder?.tankSize ?? null,
      paymentType: lastOrder?.paymentType ?? 'cash',
      supplierId: lastOrder?.supplierId ?? null,
      preferredLanguage: profile?.preferredLanguage ?? 'ar',
      notes: lastOrder?.notes ?? null,
    };
  }

  @Get('me/smart-reorder')
  @ApiOperation({
    summary: 'Smart reorder suggestion from defaults + last order (locale-aware copy)',
  })
  async smartReorder(
    @CurrentUser() user: JwtPayload,
    @Locale() locale: AppLocale,
  ) {
    const defaults = await this.orderDefaults(user);
    const ready =
      !!defaults.addressId && !!defaults.tankSizeId && !!defaults.paymentType;

    const tankName =
      locale === 'en'
        ? defaults.tankSize?.nameEn ?? defaults.tankSize?.nameAr
        : defaults.tankSize?.nameAr ?? defaults.tankSize?.nameEn;

    return {
      ready,
      suggestion: ready
        ? {
            addressId: defaults.addressId,
            tankSizeId: defaults.tankSizeId,
            paymentType: defaults.paymentType,
            supplierId: defaults.supplierId,
            tankName,
          }
        : null,
      message: ready
        ? locale === 'en'
          ? `Reorder ${tankName ?? 'your usual'} to your saved address?`
          : `إعادة طلب ${tankName ?? 'طلبك المعتاد'} إلى عنوانك المحفوظ؟`
        : locale === 'en'
          ? 'Complete one order to unlock 3-tap reorder'
          : 'أكمل طلباً واحداً لتفعيل إعادة الطلب بثلاث نقرات',
      estimatedTaps: ready ? 1 : 3,
    };
  }

  @Post('me/order-defaults')
  @ApiOperation({ summary: 'Persist order defaults after successful order' })
  async saveOrderDefaults(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      addressId?: string;
      tankSizeId?: string;
      paymentType?: string;
      supplierId?: string;
      notes?: string;
    },
  ) {
    // Defaults are derived from last order; optionally mark address default
    if (body.addressId) {
      await this.prisma.address.updateMany({
        where: { userId: user.sub },
        data: { isDefault: false },
      });
      await this.prisma.address.updateMany({
        where: { id: body.addressId, userId: user.sub },
        data: { isDefault: true },
      });
    }
    return this.orderDefaults(user);
  }
}
