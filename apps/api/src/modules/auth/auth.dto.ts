import { IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+966501234567' })
  @IsString()
  @Matches(/^\+9665\d{8}$/, { message: 'Phone must be Saudi format +9665XXXXXXXX' })
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+966501234567' })
  @IsString()
  @Matches(/^\+9665\d{8}$/)
  phone!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code!: string;

  @ApiProperty({ example: 'customer', enum: ['customer', 'driver', 'supplier', 'admin'] })
  @IsString()
  role!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
