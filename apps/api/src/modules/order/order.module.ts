import { Module, forwardRef } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderStateMachine } from './order-state-machine';
import { DispatchModule } from '../dispatch/dispatch.module';

@Module({
  imports: [forwardRef(() => DispatchModule)],
  controllers: [OrderController],
  providers: [OrderService, OrderStateMachine],
  exports: [OrderService, OrderStateMachine],
})
export class OrderModule {}
