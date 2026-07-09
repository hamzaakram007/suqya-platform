import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType, SlaType } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty()
  @IsUUID()
  addressId!: string;

  @ApiProperty()
  @IsUUID()
  tankSizeId!: string;

  @ApiProperty({ enum: PaymentType })
  @IsEnum(PaymentType)
  paymentType!: PaymentType;

  @ApiPropertyOptional({ enum: SlaType })
  @IsOptional()
  @IsEnum(SlaType)
  slaType?: SlaType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supplierId?: string;
}

export class CancelOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RateOrderDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  score!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
