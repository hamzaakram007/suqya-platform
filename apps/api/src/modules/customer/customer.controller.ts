import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
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
}
