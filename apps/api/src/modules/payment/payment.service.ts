import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.module';
import { Decimal } from '@prisma/client/runtime/library';
import { OrderCompletionService } from '../order/order-completion.service';

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
    private orderCompletion: OrderCompletionService,
  ) {}

  async createIntent(
    tenantId: string,
    orderId: string,
    amount: Decimal,
    method: string,
    customerId: string,
  ): Promise<PaymentIntentResult> {
    const order = await this.prisma.order.findFirstOrThrow({
      where: { id: orderId, tenantId, customerId },
    });

    if (order.status !== 'payment_pending' && order.status !== 'delivered') {
      throw new UnauthorizedException('Order not ready for payment');
    }

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
      return { transactionId: transaction.id, status: 'pending' };
    }

    const moyasarKey = this.config.get('MOYASAR_SECRET_KEY');
    const gatewayRef = `moy_${transaction.id.slice(0, 8)}`;

    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        gatewayRef,
        metadata: {
          provider: 'moyasar',
          publishableKey: this.config.get('MOYASAR_PUBLISHABLE_KEY'),
        },
      },
    });

    const callbackUrl = this.config.get('PAYMENT_CALLBACK_URL');
    const redirectUrl = moyasarKey
      ? `https://api.moyasar.com/v1/payments?amount=${amount.mul(100).toNumber()}&currency=SAR&description=Order+${order.orderNumber}&callback_url=${encodeURIComponent(callbackUrl ?? '')}&source[type]=creditcard`
      : `${callbackUrl}?txn=${transaction.id}`;

    return {
      transactionId: transaction.id,
      clientSecret: gatewayRef,
      redirectUrl,
      status: 'pending',
    };
  }

  async capture(transactionId: string, tenantId?: string) {
    const transaction = await this.prisma.transaction.findFirstOrThrow({
      where: tenantId ? { id: transactionId, tenantId } : { id: transactionId },
      include: { order: true },
    });

    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'completed' },
    });

    if (transaction.orderId && transaction.order) {
      await this.prisma.order.update({
        where: { id: transaction.orderId },
        data: { status: 'completed', completedAt: new Date() },
      });

      await this.orderCompletion.onOrderCompleted(
        transaction.orderId,
        transaction.tenantId,
      );
    }

    return { transactionId, status: 'completed' };
  }

  async createSplitPayment(
    tenantId: string,
    orderId: string,
    splits: { method: string; amount: number }[],
    customerId: string,
  ) {
    await this.prisma.order.findFirstOrThrow({
      where: { id: orderId, tenantId, customerId },
    });

    const total = splits.reduce((sum, s) => sum + s.amount, 0);

    return this.prisma.transaction.create({
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
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = this.config.get('MOYASAR_WEBHOOK_SECRET');
    if (!secret) return this.config.get('NODE_ENV') !== 'production';

    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    try {
      return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  async handleWebhook(payload: Record<string, unknown>, rawBody?: string, signature?: string) {
    if (this.config.get('NODE_ENV') === 'production' && !signature) {
      throw new UnauthorizedException('Missing webhook signature');
    }

    if (rawBody && signature) {
      if (!this.verifyWebhookSignature(rawBody, signature)) {
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    const gatewayRef = (payload.id ?? payload.payment_id) as string;
    const transaction = await this.prisma.transaction.findFirst({
      where: { gatewayRef },
    });

    if (!transaction) return { received: true };

    const status = payload.status as string;
    if (status === 'paid' || status === 'captured') {
      await this.capture(transaction.id);
    } else if (status === 'failed') {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'failed' },
      });
    }

    return { received: true };
  }
}
