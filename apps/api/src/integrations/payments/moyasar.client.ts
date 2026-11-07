import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isPlaceholderSecret } from '../sms/sms.types';

export type PaymentMode = 'sandbox' | 'moyasar';

export interface MoyasarCreatePaymentInput {
  amountHalalas: number;
  currency: string;
  description: string;
  callbackUrl: string;
  metadata?: Record<string, string>;
}

export interface MoyasarCreatePaymentResult {
  mode: PaymentMode;
  gatewayRef: string;
  redirectUrl: string;
  clientSecret?: string;
  status: string;
}

/**
 * Moyasar test/live HTTP client with honest sandbox fallback when keys are missing
 * or PAYMENT_MODE=sandbox.
 */
@Injectable()
export class MoyasarClient {
  private readonly logger = new Logger(MoyasarClient.name);

  constructor(private config: ConfigService) {}

  resolveMode(): PaymentMode {
    const forced = (this.config.get<string>('PAYMENT_MODE') ?? 'auto').toLowerCase();
    if (forced === 'sandbox') return 'sandbox';
    if (forced === 'moyasar') return 'moyasar';
    const secret = this.config.get<string>('MOYASAR_SECRET_KEY');
    if (isPlaceholderSecret(secret)) return 'sandbox';
    return 'moyasar';
  }

  async createPayment(
    input: MoyasarCreatePaymentInput,
    transactionId: string,
  ): Promise<MoyasarCreatePaymentResult> {
    const mode = this.resolveMode();
    if (mode === 'sandbox') {
      const gatewayRef = `sandbox_${transactionId.slice(0, 8)}`;
      const callback =
        this.config.get<string>('PAYMENT_CALLBACK_URL') ??
        'http://localhost:3000/payment/callback';
      this.logger.log(
        `[sandbox-payment] intent ${transactionId} amount=${input.amountHalalas}`,
      );
      return {
        mode: 'sandbox',
        gatewayRef,
        // Capture via POST /payments/capture — no interactive browser needed.
        redirectUrl: `${callback}?txn=${transactionId}&sandbox=1`,
        clientSecret: gatewayRef,
        status: 'initiated',
      };
    }

    const secret = this.config.getOrThrow<string>('MOYASAR_SECRET_KEY');
    const auth = Buffer.from(`${secret}:`).toString('base64');
    const res = await fetch('https://api.moyasar.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: input.amountHalalas,
        currency: input.currency,
        description: input.description,
        callback_url: input.callbackUrl,
        source: { type: 'creditcard' },
        metadata: input.metadata ?? {},
      }),
    });

    const body = (await res.json()) as {
      id?: string;
      status?: string;
      source?: { transaction_url?: string };
      message?: string;
    };

    if (!res.ok || !body.id) {
      this.logger.error(`Moyasar create failed: ${JSON.stringify(body)}`);
      throw new Error(body.message ?? `Moyasar create failed (${res.status})`);
    }

    return {
      mode: 'moyasar',
      gatewayRef: body.id,
      redirectUrl:
        body.source?.transaction_url ??
        `${input.callbackUrl}?id=${body.id}`,
      clientSecret: body.id,
      status: body.status ?? 'initiated',
    };
  }

  /**
   * Sandbox capture: always succeeds. Live mode: fetch payment status from Moyasar.
   */
  async verifyPaid(gatewayRef: string): Promise<boolean> {
    if (gatewayRef.startsWith('sandbox_') || this.resolveMode() === 'sandbox') {
      return true;
    }
    const secret = this.config.getOrThrow<string>('MOYASAR_SECRET_KEY');
    const auth = Buffer.from(`${secret}:`).toString('base64');
    const res = await fetch(`https://api.moyasar.com/v1/payments/${gatewayRef}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { status?: string };
    return body.status === 'paid' || body.status === 'captured';
  }
}
