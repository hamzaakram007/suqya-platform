import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/tracking' })
export class TrackingGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('subscribe_order')
  handleSubscribe(client: Socket, orderId: string) {
    client.join(`order:${orderId}`);
    return { subscribed: orderId };
  }

  @SubscribeMessage('driver_location')
  handleDriverLocation(
    client: Socket,
    payload: { orderId: string; latitude: number; longitude: number },
  ) {
    this.server.to(`order:${payload.orderId}`).emit('location_update', payload);
    return { received: true };
  }

  broadcastOrderUpdate(orderId: string, data: Record<string, unknown>) {
    this.server.to(`order:${orderId}`).emit('order_update', data);
  }
}
