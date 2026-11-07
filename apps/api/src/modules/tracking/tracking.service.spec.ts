import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  const prisma = {
    orderTrackingPoint: { create: jest.fn() },
    order: { findMany: jest.fn() },
  };

  let service: TrackingService;
  let emit: jest.Mock;

  beforeEach(() => {
    service = new TrackingService(prisma as never);
    emit = jest.fn();
    service.bindServer({ to: () => ({ emit }) } as never);
    jest.clearAllMocks();
  });

  it('persists and broadcasts an order location', async () => {
    prisma.orderTrackingPoint.create.mockResolvedValue({});

    const result = await service.publishOrderLocation({
      orderId: 'ord-1',
      latitude: 24.71,
      longitude: 46.67,
      driverId: 'drv-1',
      source: 'rest',
    });

    expect(prisma.orderTrackingPoint.create).toHaveBeenCalledWith({
      data: { orderId: 'ord-1', latitude: 24.71, longitude: 46.67 },
    });
    expect(emit).toHaveBeenCalledWith(
      'location_update',
      expect.objectContaining({
        orderId: 'ord-1',
        latitude: 24.71,
        longitude: 46.67,
        driverId: 'drv-1',
        source: 'rest',
      }),
    );
    expect(result.recordedAt).toBeTruthy();
  });

  it('fans out REST driver pings to trackable orders', async () => {
    prisma.order.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);
    prisma.orderTrackingPoint.create.mockResolvedValue({});

    const { orderIds } = await service.publishDriverLocation({
      driverId: 'drv-1',
      latitude: 24.72,
      longitude: 46.68,
      source: 'rest',
    });

    expect(orderIds).toEqual(['a', 'b']);
    expect(prisma.orderTrackingPoint.create).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledTimes(2);
  });

  it('returns empty when driver has no trackable orders', async () => {
    prisma.order.findMany.mockResolvedValue([]);
    const { orderIds } = await service.publishDriverLocation({
      driverId: 'drv-1',
      latitude: 24.72,
      longitude: 46.68,
    });
    expect(orderIds).toEqual([]);
    expect(prisma.orderTrackingPoint.create).not.toHaveBeenCalled();
  });
});
