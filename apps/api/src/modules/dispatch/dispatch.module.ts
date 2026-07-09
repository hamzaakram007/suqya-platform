import { Module, forwardRef } from '@nestjs/common';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [forwardRef(() => OrderModule)],
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
