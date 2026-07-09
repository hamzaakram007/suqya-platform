import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';

export interface PaymentIntentResult {
  transactionId: string;
  clientSecret?: string;
  redirectUrl?: string;
  status: string;
}

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createIntent(
    tenantId: string,
    orderId: string,
    amount: Decimal,
    method: string,
  ): Promise<PaymentIntentResult> {
    const transaction = await this.prisma.transaction.create({
      data: {
        tenantId,
        orderId,
        amount,
        method,
        status: 'pending',
      },
    });

    if (method === 'cash') {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'pending' },
      });
      return { transactionId: transaction.id, status: 'pending' };
    }

    // Moyasar/HyperPay integration placeholder
    const gatewayRef = `moy_${transaction.id.slice(0, 8)}`;
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { gatewayRef, metadata: { provider: 'moyasar' } },
    });

    return {
      transactionId: transaction.id,
      clientSecret: gatewayRef,
      redirectUrl: `${this.config.get('PAYMENT_CALLBACK_URL')}?txn=${transaction.id}`,
      status: 'pending',
    };
  }

  async capture(transactionId: string) {
    const transaction = await this.prisma.transaction.findUniqueOrThrow({
      where: { id: transactionId },
      include: { order: true },
    });

    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'completed' },
    });

    if (transaction.orderId) {
      await this.prisma.order.update({
        where: { id: transaction.orderId },
        data: { status: 'completed', completedAt: new Date() },
      });
    }

    return { transactionId, status: 'completed' };
  }

  async createSplitPayment(
    tenantId: string,
    orderId: string,
    splits: { method: string; amount: number }[],
  ) {
    const total = splits.reduce((sum, s) => sum + s.amount, 0);

    const transaction = await this.prisma.transaction.create({
      data: {
        tenantId,
        orderId,
        amount: new Decimal(total),
        method: 'split',
        status: 'pending',
        splits: {
          create: splits.map((s) => ({
            method: s.method,
            amount: new Decimal(s.amount),
          })),
        },
      },
      include: { splits: true },
    });

    return transaction;
  }

  async handleWebhook(payload: Record<string, unknown>) {
    const gatewayRef = payload.id as string;
    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayRef },
    });

    if (!transaction) return { received: true };

    if (payload.status === 'paid') {
      await this.capture(transaction.id);
    }

    return { received: true };
  }
}
