import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: '/events',
  cors: { origin: process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? [] },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      (client as any).user = payload;
      client.join(`user:${payload.sub}`);
      this.logger.log(`Client connected: ${client.id} (userId: ${payload.sub})`);
    } catch {
      this.logger.warn(`Client ${client.id} invalid token — disconnecting`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { room: string }) {
    if (data?.room) {
      client.join(data.room);
    }
  }

  // --- Server-side emit helpers ---

  emitOrderUpdate(userId: string, payload: { orderId: string; status: string }) {
    this.server.to(`user:${userId}`).emit('order:updated', payload);
  }

  emitNotification(userId: string, payload: { message: string; type: string }) {
    this.server.to(`user:${userId}`).emit('notification', payload);
  }
}
