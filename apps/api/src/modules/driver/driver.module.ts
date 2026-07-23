import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DriverController } from './driver.controller';
import { DispatchModule } from '../dispatch/dispatch.module';
import { OrderModule } from '../order/order.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [
    forwardRef(() => DispatchModule),
    forwardRef(() => OrderModule),
    SecurityModule,
    BullModule.registerQueue({ name: 'dispatch' }),
  ],
  controllers: [DriverController],
})
export class DriverModule {}
