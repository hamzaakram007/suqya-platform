import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PrismaService } from '../../prisma/prisma.module';
import { OrderCompletionService } from '../order/order-completion.service';

describe('PaymentService', () => {
  let service: PaymentService;

  const prisma = {
    transaction: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findFirstOrThrow: jest.fn(),
    },
    order: { update: jest.fn(), findFirstOrThrow: jest.fn() },
  };

  const config = {
    get: jest.fn((key: string) => {
      if (key === 'MOYASAR_WEBHOOK_SECRET') return 'test-secret';
      if (key === 'NODE_ENV') return 'production';
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
        { provide: OrderCompletionService, useValue: { onOrderCompleted: jest.fn() } },
      ],
    }).compile();

    service = module.get(PaymentService);
    jest.clearAllMocks();
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
