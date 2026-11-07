import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.module';
import { JwtPayload } from '../common/guards/jwt-auth.guard';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true, namespace: '/tracking' })
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(TrackingGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers.authorization?.split(' ')[1] ?? '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.get('JWT_SECRET', 'suqya-dev-secret-change-in-production'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, status: true, role: true },
      });

      if (!user || user.status !== 'active') {
        client.disconnect();
        return;
      }

      client.data.user = payload;
      this.logger.log(`Client connected: ${client.id} (${payload.role})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe_order')
  async handleSubscribe(client: Socket, orderId: string) {
    const user = client.data.user as JwtPayload;
    if (!user) return { error: 'Unauthorized' };

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId: user.tenantId },
      include: { driver: true, supplier: true },
    });

    if (!order) return { error: 'Order not found' };

    const allowed =
      order.customerId === user.sub ||
      order.driver?.userId === user.sub ||
      order.supplier?.userId === user.sub ||
      ['admin', 'dispatcher'].includes(user.role);

    if (!allowed) return { error: 'Access denied' };

    client.join(`order:${orderId}`);
    return { subscribed: orderId };
  }

  @SubscribeMessage('driver_location')
  async handleDriverLocation(
    client: Socket,
    payload: { orderId: string; latitude: number; longitude: number },
  ) {
    const user = client.data.user as JwtPayload;
    if (!user || user.role !== 'driver') return { error: 'Unauthorized' };

    const driver = await this.prisma.driver.findFirst({
      where: { userId: user.sub },
    });

    const order = await this.prisma.order.findFirst({
      where: { id: payload.orderId, driverId: driver?.id },
    });

    if (!order) return { error: 'Not assigned to this order' };

    await this.prisma.orderTrackingPoint.create({
      data: {
        orderId: payload.orderId,
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
    });

    this.server.to(`order:${payload.orderId}`).emit('location_update', payload);
    return { received: true };
  }

  broadcastOrderUpdate(orderId: string, data: Record<string, unknown>) {
    this.server.to(`order:${orderId}`).emit('order_update', data);
  }
}
