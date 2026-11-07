import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma/prisma.module';
import { OrderCompletionService } from '../order/order-completion.service';
import { MoyasarClient } from '../../integrations/payments/moyasar.client';
import { Decimal } from '@prisma/client/runtime/library';

describe('PaymentService', () => {
  let service: PaymentService;

  const prisma = {
    transaction: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findFirstOrThrow: jest.fn(),
    },
    order: {
      update: jest.fn(),
      findFirstOrThrow: jest.fn(),
    },
    orderStatusHistory: { create: jest.fn() },
  };

  const config = {
    get: jest.fn((key: string) => {
      if (key === 'MOYASAR_WEBHOOK_SECRET') return 'test-secret';
      if (key === 'NODE_ENV') return 'production';
      if (key === 'PAYMENT_CALLBACK_URL') return 'http://localhost/callback';
      return undefined;
    }),
  };

  const moyasar = {
    resolveMode: jest.fn().mockReturnValue('sandbox'),
    createPayment: jest.fn().mockResolvedValue({
      mode: 'sandbox',
      gatewayRef: 'sandbox_abc',
      redirectUrl: 'http://localhost/callback?txn=t1&sandbox=1',
      clientSecret: 'sandbox_abc',
      status: 'initiated',
    }),
    verifyPaid: jest.fn().mockResolvedValue(true),
  };

  const completion = { onOrderCompleted: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
        { provide: OrderCompletionService, useValue: completion },
        { provide: MoyasarClient, useValue: moyasar },
      ],
    }).compile();

    service = module.get(PaymentService);
    jest.clearAllMocks();
  });

  it('creates sandbox card intent when Moyasar keys are missing', async () => {
    prisma.order.findFirstOrThrow.mockResolvedValue({
      id: 'o1',
      status: 'payment_pending',
      orderNumber: 'SQ-1',
    });
    prisma.transaction.create.mockResolvedValue({ id: 't1' });
    prisma.transaction.update.mockResolvedValue({});

    const result = await service.createIntent(
      'tenant',
      'o1',
      new Decimal(150),
      'card',
      'cust',
    );

    expect(moyasar.createPayment).toHaveBeenCalled();
    expect(result.mode).toBe('sandbox');
    expect(result.transactionId).toBe('t1');
  });

  it('rejects webhook without signature in production', async () => {
    await expect(
      service.handleWebhook({ status: 'paid', id: 'moy_abc' }, '{}', undefined),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('verifies valid HMAC signature', () => {
    const payload = '{"id":"moy_abc","status":"paid"}';
    const crypto = require('crypto');
    const sig = crypto.createHmac('sha256', 'test-secret').update(payload).digest('hex');
    expect(service.verifyWebhookSignature(payload, sig)).toBe(true);
  });
});
