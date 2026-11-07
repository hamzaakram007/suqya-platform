import { Test, TestingModule } from '@nestjs/testing';
import { DispatchService } from './dispatch.service';
import { PrismaService } from '../../prisma/prisma.module';
import { OrderStateMachine } from '../order/order-state-machine';

describe('DispatchService', () => {
  let service: DispatchService;

  const mockPrisma = {
    driver: { findMany: jest.fn() },
    order: { findFirstOrThrow: jest.fn(), update: jest.fn(), findUniqueOrThrow: jest.fn() },
    orderAssignment: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  };

  const mockStateMachine = {
    transition: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: OrderStateMachine, useValue: mockStateMachine },
        { provide: 'BullQueue_dispatch', useValue: { add: jest.fn() } },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
  });

  it('should calculate haversine distance correctly', () => {
    const distance = (service as unknown as { haversineDistance: (a: number, b: number, c: number, d: number) => number })
      .haversineDistance(24.7136, 46.6753, 24.7236, 46.6853);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(2);
  });

  it('should score closer drivers higher', () => {
    const score = (service as unknown as { calculateScore: (d: number, p: number) => number })
      .calculateScore(1, 5);
    const farScore = (service as unknown as { calculateScore: (d: number, p: number) => number })
      .calculateScore(10, 5);
    expect(score).toBeGreaterThan(farScore);
  });
});
