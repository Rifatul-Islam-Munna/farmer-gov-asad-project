import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import Redis from 'ioredis';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';

type ChatUser = { id: string; email: string };
type ChatMessageInput = {
  receiverId: string;
  text: string;
  productId?: string;
  clientMessageId?: string;
};
type StoredChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  productId?: string;
  text: string;
  sentAt: string;
  expiresAt: string;
  temporary: true;
  storage: 'redis';
};

@WebSocketGateway({
  namespace: '/marketplace-chat',
  cors: { origin: true, credentials: true },
  transports: ['websocket'],
})
export class MarketplaceChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MarketplaceChatGateway.name);
  private readonly redis?: Redis;
  private readonly ttlSeconds = 60 * 60;
  private readonly cooldownSeconds = 60;

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly userService: UserService,
    config: ConfigService,
  ) {
    const redisUrl = config.get<string>('REDIS_URL');
    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      });
    }
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.userService.verifyAccessToken(
        this.extractToken(client),
      );
      (client.data as Record<string, unknown>).user = {
        id: user.id,
        email: user.email,
      } satisfies ChatUser;
      await client.join(this.userRoom(user.id));
      client.emit('chat:ready', {
        userId: user.id,
        temporary: true,
        storage: 'redis',
        retentionSeconds: this.ttlSeconds,
        cooldownSeconds: this.cooldownSeconds,
      });
    } catch (error) {
      this.logger.warn(
        `Rejected marketplace chat connection ${client.id}: ${
          error instanceof Error ? error.message : 'authentication failed'
        }`,
      );
      client.emit('chat:error', { message: 'Authentication failed' });
      client.disconnect(true);
    }
  }

  handleDisconnect() {
    // Messages remain in Redis only until their one-hour TTL expires.
  }

  @SubscribeMessage('chat:join')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { otherUserId: string; productId?: string },
  ) {
    const user = this.requireUser(client);
    const otherUserId = payload.otherUserId?.trim();
    if (!otherUserId || otherUserId === user.id) {
      throw new WsException('A valid chat participant is required');
    }
    const conversationKey = this.conversationKey(
      user.id,
      otherUserId,
      payload.productId,
    );
    const messages = await this.readHistory(conversationKey);
    client.emit('chat:history', {
      messages,
      retentionSeconds: this.ttlSeconds,
    });
    return { joined: true, messages: messages.length };
  }

  @SubscribeMessage('chat:send')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatMessageInput,
  ) {
    const sender = this.requireUser(client);
    const receiverId = payload.receiverId?.trim();
    const text = payload.text?.trim();
    if (!receiverId) throw new WsException('Receiver is required');
    if (!text) throw new WsException('Message cannot be empty');
    if (text.length > 1000) throw new WsException('Message is too long');
    if (receiverId === sender.id) {
      throw new WsException('You cannot message yourself');
    }

    const retryAfterSeconds = await this.acquireCooldown(sender.id);
    if (retryAfterSeconds > 0) {
      client.emit('chat:cooldown', { retryAfterSeconds });
      throw new WsException(
        `Please wait ${retryAfterSeconds} seconds before sending again`,
      );
    }

    const now = new Date();
    const message: StoredChatMessage = {
      id: payload.clientMessageId?.trim() || `${client.id}:${now.getTime()}`,
      senderId: sender.id,
      receiverId,
      productId: payload.productId?.trim() || undefined,
      text,
      sentAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + this.ttlSeconds * 1000).toISOString(),
      temporary: true,
      storage: 'redis',
    };

    await this.storeMessage(
      this.conversationKey(sender.id, receiverId, message.productId),
      message,
    );
    this.server.to(this.userRoom(receiverId)).emit('chat:message', message);
    client.emit('chat:message', message);
    client.emit('chat:cooldown', {
      retryAfterSeconds: this.cooldownSeconds,
    });
    return { delivered: true, messageId: message.id };
  }

  private async acquireCooldown(userId: string) {
    const redis = await this.readyRedis();
    const key = `marketplace:chat:cooldown:${userId}`;
    const acquired = await redis.set(
      key,
      Date.now().toString(),
      'EX',
      this.cooldownSeconds,
      'NX',
    );
    if (acquired === 'OK') return 0;
    const ttl = await redis.ttl(key);
    return Math.max(1, ttl);
  }

  private async storeMessage(key: string, message: StoredChatMessage) {
    const redis = await this.readyRedis();
    await redis
      .multi()
      .rpush(key, JSON.stringify(message))
      .ltrim(key, -100, -1)
      .expire(key, this.ttlSeconds)
      .exec();
  }

  private async readHistory(key: string): Promise<StoredChatMessage[]> {
    const redis = await this.readyRedis();
    const rows = await redis.lrange(key, 0, -1);
    return rows
      .map((row) => {
        try {
          return JSON.parse(row) as StoredChatMessage;
        } catch {
          return null;
        }
      })
      .filter((row): row is StoredChatMessage => Boolean(row));
  }

  private async readyRedis() {
    if (!this.redis) {
      throw new WsException('Temporary chat storage is unavailable');
    }
    if (this.redis.status === 'wait') await this.redis.connect();
    return this.redis;
  }

  private conversationKey(a: string, b: string, productId?: string) {
    const users = [a, b].sort();
    return `marketplace:chat:conversation:${users[0]}:${users[1]}:${
      productId?.trim() || 'general'
    }`;
  }

  private extractToken(client: Socket) {
    const auth = client.handshake.auth as Record<string, unknown>;
    if (typeof auth.token === 'string' && auth.token.trim()) {
      return auth.token.trim();
    }
    const authorization = client.handshake.headers.authorization;
    if (typeof authorization === 'string') {
      const match = authorization.match(/^Bearer\s+(.+)$/i);
      if (match?.[1]) return match[1].trim();
    }
    throw new WsException('Access token is required');
  }

  private requireUser(client: Socket) {
    const candidate = (client.data as Record<string, unknown>).user;
    if (
      !candidate ||
      typeof candidate !== 'object' ||
      typeof (candidate as { id?: unknown }).id !== 'string' ||
      typeof (candidate as { email?: unknown }).email !== 'string'
    ) {
      throw new WsException('Authentication required');
    }
    return candidate as ChatUser;
  }

  private userRoom(userId: string) {
    return `marketplace-user:${userId}`;
  }
}
