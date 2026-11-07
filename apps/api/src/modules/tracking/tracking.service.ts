import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.module';

export const TRACKABLE_ORDER_STATUSES: OrderStatus[] = [
  'accepted',
  'filling',
  'in_transit',
];

export type LocationPayload = {
  orderId: string;
  latitude: number;
  longitude: number;
  driverId?: string;
  recordedAt?: string;
  source?: 'socket' | 'rest' | 'sandbox';
};

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);
  private server: Server | null = null;

  constructor(private prisma: PrismaService) {}

  bindServer(server: Server) {
    this.server = server;
  }

  /**
   * Persist a tracking point and fan-out to the order room.
   */
  async publishOrderLocation(payload: LocationPayload): Promise<LocationPayload> {
    const recordedAt = payload.recordedAt ?? new Date().toISOString();
    const body: LocationPayload = { ...payload, recordedAt };

    await this.prisma.orderTrackingPoint.create({
      data: {
        orderId: payload.orderId,
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
    });

    this.emitLocation(payload.orderId, body);
    return body;
  }

  /**
   * After a driver REST GPS ping: update subscribers for every active job
   * (or a single orderId when provided).
   */
  async publishDriverLocation(params: {
    driverId: string;
    latitude: number;
    longitude: number;
    orderId?: string;
    source?: LocationPayload['source'];
  }): Promise<{ orderIds: string[] }> {
    // Explicit orderId: any assignment (handy for smoke / late pings).
    // Implicit: only live fulfillment statuses.
    const where = params.orderId
      ? {
          id: params.orderId,
          driverId: params.driverId,
        }
      : {
          driverId: params.driverId,
          status: { in: TRACKABLE_ORDER_STATUSES },
        };

    const orders = await this.prisma.order.findMany({
      where,
      select: { id: true },
    });

    const orderIds: string[] = [];
    for (const order of orders) {
      await this.publishOrderLocation({
        orderId: order.id,
        latitude: params.latitude,
        longitude: params.longitude,
        driverId: params.driverId,
        source: params.source ?? 'rest',
      });
      orderIds.push(order.id);
    }

    if (orderIds.length === 0) {
      this.logger.debug(
        `No trackable orders for driver ${params.driverId} (orderId=${params.orderId ?? 'any'})`,
      );
    }

    return { orderIds };
  }

  emitLocation(orderId: string, payload: LocationPayload) {
    if (!this.server) {
      this.logger.warn('Tracking server not bound; location not broadcast');
      return;
    }
    this.server.to(`order:${orderId}`).emit('location_update', payload);
  }

  emitOrderUpdate(orderId: string, data: Record<string, unknown>) {
    if (!this.server) return;
    this.server.to(`order:${orderId}`).emit('order_update', data);
  }
}
