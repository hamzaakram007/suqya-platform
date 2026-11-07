import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+966501234567' })
  @IsString()
  @Matches(/^\+9665\d{8}$/, { message: 'Phone must be Saudi format +9665XXXXXXXX' })
  phone!: string;
}

export { VerifyOtpDto } from './verify-otp.dto';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}
