import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderStateMachine } from './order-state-machine';
import { OrderCompletionService } from './order-completion.service';
import { DispatchModule } from '../dispatch/dispatch.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { AccountingModule } from '../accounting/accounting.module';
import { NotificationModule } from '../notification/notification.module';
import { CreditModule } from '../credit/credit.module';
import { SettlementModule } from '../settlement/settlement.module';

@Module({
  imports: [
    forwardRef(() => DispatchModule),
    InvoiceModule,
    AccountingModule,
    NotificationModule,
    CreditModule,
    SettlementModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderStateMachine, OrderCompletionService],
  exports: [OrderService, OrderStateMachine, OrderCompletionService],
})
export class OrderModule {}
