import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { OrderService } from './order.service';
import { PrismaService } from '../../prisma/prisma.module';
import { OrderStateMachine } from './order-state-machine';
import { DispatchService } from '../dispatch/dispatch.service';
import { CreditService } from '../credit/credit.service';

describe('OrderService', () => {
  let service: OrderService;

  const prisma = {
    order: {
      findFirst: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: prisma },
        { provide: OrderStateMachine, useValue: {} },
        { provide: DispatchService, useValue: {} },
        { provide: CreditService, useValue: {} },
      ],
    }).compile();

    service = module.get(OrderService);
    jest.clearAllMocks();
  });

  it('denies tracking for unauthorized users', async () => {
    prisma.order.findFirst.mockResolvedValue({
      id: 'o1',
      tenantId: 't1',
      customerId: 'other',
      driver: null,
      supplier: null,
    });

    await expect(
      service.track('o1', {
        sub: 'u1',
        tenantId: 't1',
        role: 'customer',
        phone: '+966501234567',
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
