import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  AuditService,
  TwoFactorService,
  PdplService,
  FraudDetectionService,
} from './security.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class Verify2FaDto {
  @ApiProperty() @IsString() token!: string;
}

@ApiTags('Security')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('security')
export class SecurityController {
  constructor(
    private audit: AuditService,
    private twoFactor: TwoFactorService,
    private pdpl: PdplService,
    private fraud: FraudDetectionService,
  ) {}

  @Get('audit-logs')
  @Roles('admin')
  @ApiOperation({ summary: 'List audit logs' })
  auditLogs(@CurrentUser() user: JwtPayload) {
    return this.audit.list(user.tenantId);
  }

  @Post('2fa/setup')
  @Roles('admin', 'supplier')
  @ApiOperation({ summary: 'Setup 2FA' })
  setup2fa(@CurrentUser() user: JwtPayload) {
    return this.twoFactor.generateSecret(user.sub);
  }

  @Post('2fa/verify')
  @ApiOperation({ summary: 'Verify 2FA token' })
  verify2fa(@CurrentUser() user: JwtPayload, @Body() dto: Verify2FaDto) {
    return { valid: this.twoFactor.verify(user.sub, dto.token) };
  }

  @Get('pdpl/export')
  @ApiOperation({ summary: 'Export personal data (PDPL)' })
  exportData(@CurrentUser() user: JwtPayload) {
    return this.pdpl.exportUserData(user.sub);
  }

  @Post('pdpl/delete')
  @ApiOperation({ summary: 'Request account deletion (PDPL)' })
  deleteData(@CurrentUser() user: JwtPayload) {
    return this.pdpl.requestDeletion(user.sub);
  }
}
