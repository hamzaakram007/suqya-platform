import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { DispatchProcessor } from './dispatch.processor';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    forwardRef(() => OrderModule),
    BullModule.registerQueue({ name: 'dispatch' }),
  ],
  controllers: [DispatchController],
  providers: [DispatchService, DispatchProcessor],
  exports: [DispatchService],
})
export class DispatchModule {}
