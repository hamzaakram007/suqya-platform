import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class VerifyOtpDto {
  @ApiProperty({ example: '+966501234567' })
  @IsString()
  @Matches(/^\+9665\d{8}$/, { message: 'Phone must be Saudi format +9665XXXXXXXX' })
  phone!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  code!: string;

  @ApiPropertyOptional({
    example: 'customer',
    enum: [UserRole.customer, UserRole.driver, UserRole.supplier],
    description: 'Only customer, driver, supplier allowed for self-registration',
  })
  @IsOptional()
  @IsEnum([UserRole.customer, UserRole.driver, UserRole.supplier])
  role?: UserRole;
}
