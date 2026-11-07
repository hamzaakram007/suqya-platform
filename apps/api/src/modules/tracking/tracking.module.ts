import { Module } from '@nestjs/common';
import { TrackingGateway } from '../../gateways/tracking.gateway';
import { TrackingService } from './tracking.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TrackingService, TrackingGateway],
  exports: [TrackingService, TrackingGateway],
})
export class TrackingModule {}
