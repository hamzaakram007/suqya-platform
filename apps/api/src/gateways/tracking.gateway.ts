import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { JwtPayload } from '../common/guards/jwt-auth.guard';
import { TrackingService } from '../modules/tracking/tracking.service';
import { resolveJwtSecrets } from '../common/config/jwt-secret';
import { verifyAccessToken } from '../common/auth/verify-access-token';

@WebSocketGateway({ cors: true, namespace: '/tracking' })
export class TrackingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(TrackingGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
    private tracking: TrackingService,
  ) {}

  afterInit(server: Server) {
    this.tracking.bindServer(server);
    this.logger.log('Tracking gateway ready (namespace /tracking)');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers.authorization?.split(' ')[1] ?? '');

      if (!token) {
        client.disconnect();
        return;
      }

      const secrets = resolveJwtSecrets({
        JWT_SECRET: this.config.get<string>('JWT_SECRET'),
        JWT_SECRET_PREVIOUS: this.config.get<string>('JWT_SECRET_PREVIOUS'),
        NODE_ENV: this.config.get<string>('NODE_ENV'),
        APP_ENV: this.config.get<string>('APP_ENV'),
        REQUIRE_STRONG_JWT: this.config.get<string>('REQUIRE_STRONG_JWT'),
      });
      const payload = verifyAccessToken(this.jwtService, token, secrets);

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

    // Seed last-known driver point so late subscribers see a marker immediately.
    if (order.driver?.latitude != null && order.driver?.longitude != null) {
      client.emit('location_update', {
        orderId,
        latitude: order.driver.latitude,
        longitude: order.driver.longitude,
        driverId: order.driver.id,
        source: 'rest',
        recordedAt: new Date().toISOString(),
      });
    }

    return { subscribed: orderId };
  }

  @SubscribeMessage('driver_location')
  async handleDriverLocation(
    client: Socket,
    payload: { orderId: string; latitude: number; longitude: number },
  ) {
    const user = client.data.user as JwtPayload;
    if (!user || user.role !== 'driver') return { error: 'Unauthorized' };

    if (
      !payload?.orderId ||
      typeof payload.latitude !== 'number' ||
      typeof payload.longitude !== 'number'
    ) {
      return { error: 'Invalid payload' };
    }

    const driver = await this.prisma.driver.findFirst({
      where: { userId: user.sub },
    });
    if (!driver) return { error: 'Driver not found' };

    const order = await this.prisma.order.findFirst({
      where: { id: payload.orderId, driverId: driver.id },
    });
    if (!order) return { error: 'Not assigned to this order' };

    await this.prisma.driver.update({
      where: { id: driver.id },
      data: { latitude: payload.latitude, longitude: payload.longitude },
    });

    const published = await this.tracking.publishOrderLocation({
      orderId: payload.orderId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      driverId: driver.id,
      source: 'socket',
    });

    return { received: true, ...published };
  }

  /** @deprecated Prefer TrackingService.emitOrderUpdate */
  broadcastOrderUpdate(orderId: string, data: Record<string, unknown>) {
    this.tracking.emitOrderUpdate(orderId, data);
  }
}
