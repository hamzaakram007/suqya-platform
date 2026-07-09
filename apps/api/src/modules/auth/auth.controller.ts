import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto, RefreshTokenDto } from './auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP to Saudi mobile number' })
  @ApiHeader({ name: 'X-Tenant-Id', required: true })
  async sendOtp(
    @Body() dto: SendOtpDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-Id required');
    return this.authService.sendOtp(dto, tenantId);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP and receive JWT tokens' })
  @ApiHeader({ name: 'X-Tenant-Id', required: true })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-Id required');
    return this.authService.verifyOtp(dto, tenantId);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
