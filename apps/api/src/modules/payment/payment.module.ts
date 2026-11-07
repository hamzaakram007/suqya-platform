import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrderModule } from '../order/order.module';
import { MoyasarClient } from '../../integrations/payments/moyasar.client';

@Module({
  imports: [forwardRef(() => OrderModule)],
  controllers: [PaymentController],
  providers: [PaymentService, MoyasarClient],
  exports: [PaymentService, MoyasarClient],
})
export class PaymentModule {}
