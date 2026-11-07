import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DriverController } from './driver.controller';
import { DispatchModule } from '../dispatch/dispatch.module';
import { OrderModule } from '../order/order.module';
import { SecurityModule } from '../security/security.module';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [
    forwardRef(() => DispatchModule),
    forwardRef(() => OrderModule),
    SecurityModule,
    TrackingModule,
    BullModule.registerQueue({ name: 'dispatch' }),
  ],
  controllers: [DriverController],
})
export class DriverModule {}
