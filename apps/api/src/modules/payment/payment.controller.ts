import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.module';
import { IsString, IsUUID, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

class PaymentIntentDto {
  @ApiProperty() @IsUUID() orderId!: string;
  @ApiProperty() @IsString() method!: string;
}

class SplitItemDto {
  @ApiProperty() @IsString() method!: string;
  @ApiProperty() @IsNumber() amount!: number;
}

class SplitPaymentDto {
  @ApiProperty() @IsUUID() orderId!: string;
  @ApiProperty({ type: [SplitItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => SplitItemDto)
  splits!: SplitItemDto[];
}

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private prisma: PrismaService,
  ) {}

  @Post('intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent' })
  async createIntent(@CurrentUser() user: JwtPayload, @Body() dto: PaymentIntentDto) {
    const order = await this.prisma.order.findFirstOrThrow({
      where: { id: dto.orderId, tenantId: user.tenantId },
    });
    return this.paymentService.createIntent(
      user.tenantId,
      dto.orderId,
      order.totalAmount,
      dto.method,
    );
  }

  @Post('capture')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Capture payment' })
  capture(@Body('transactionId') transactionId: string) {
    return this.paymentService.capture(transactionId);
  }

  @Post('split')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Split payment across methods' })
  split(@CurrentUser() user: JwtPayload, @Body() dto: SplitPaymentDto) {
    return this.paymentService.createSplitPayment(user.tenantId, dto.orderId, dto.splits);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Payment gateway webhook' })
  webhook(@Body() payload: Record<string, unknown>) {
    return this.paymentService.handleWebhook(payload);
  }
}
