import { Module } from '@nestjs/common';
import {
  AuditService,
  TwoFactorService,
  PdplService,
  FraudDetectionService,
} from './security.service';
import { SecurityController } from './security.controller';

@Module({
  controllers: [SecurityController],
  providers: [AuditService, TwoFactorService, PdplService, FraudDetectionService],
  exports: [AuditService, FraudDetectionService],
})
export class SecurityModule {}
