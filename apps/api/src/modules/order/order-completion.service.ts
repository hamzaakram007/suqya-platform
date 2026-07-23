import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { InvoiceService } from '../invoice/invoice.service';
import { AccountingService } from '../accounting/accounting.service';
import { NotificationService } from '../notification/notification.service';
import { CreditService } from '../credit/credit.service';
import { SettlementService } from '../settlement/settlement.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderCompletionService {
  constructor(
    private prisma: PrismaService,
    private invoiceService: InvoiceService,
    private accountingService: AccountingService,
    private notificationService: NotificationService,
    private creditService: CreditService,
    private settlementService: SettlementService,
  ) {}

  async onOrderCompleted(orderId: string, tenantId: string) {
    const order = await this.prisma.order.findFirstOrThrow({
      where: { id: orderId, tenantId },
      include: { customer: { include: { profile: true } } },
    });

    if (order.status !== OrderStatus.completed) {
      return { skipped: true, reason: 'Order not in completed status' };
    }

    const existingInvoice = await this.prisma.invoice.findFirst({
      where: { orderId },
    });

    const results: Record<string, unknown> = {};

    if (!existingInvoice) {
      results.invoice = await this.invoiceService.createFromOrder(orderId, tenantId);
    }

    const existingJournal = await this.prisma.journalEntry.findFirst({
      where: { referenceType: 'order', referenceId: orderId },
    });

    if (!existingJournal) {
      results.journal = await this.accountingService.postOrderJournal(tenantId, orderId);
    }

    if (order.supplierId) {
      results.settlement = await this.settlementService.createFromOrder(order);
    }

    await this.notificationService.sendOrderCompleted({
      orderId,
      customerId: order.customerId,
      customerPhone: order.customer.phone,
      customerName: order.customer.profile?.nameAr ?? order.customer.phone,
      orderNumber: order.orderNumber,
    });

    return { completed: true, ...results };
  }

  async completeCreditOrder(orderId: string, tenantId: string) {
    const order = await this.prisma.order.findFirstOrThrow({
      where: { id: orderId, tenantId },
    });

    if (order.paymentType === 'credit') {
      await this.creditService.chargeOnOrder(
        order.customerId,
        orderId,
        order.totalAmount,
      );
    }
  }
}
