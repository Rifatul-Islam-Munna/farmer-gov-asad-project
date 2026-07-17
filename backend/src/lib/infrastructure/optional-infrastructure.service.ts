import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import Redis from 'ioredis';

@Injectable()
export class OptionalInfrastructureService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(OptionalInfrastructureService.name);
  private redis?: Redis;
  private qdrant?: QdrantClient;

  private redisAvailable = false;
  private qdrantAvailable = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await Promise.allSettled([this.initializeRedis(), this.initializeQdrant()]);
  }

  async onApplicationShutdown() {
    if (this.redis) {
      await this.redis.quit().catch(() => undefined);
    }
  }

  getRedis(): Redis | undefined {
    return this.redisAvailable ? this.redis : undefined;
  }

  getQdrant(): QdrantClient | undefined {
    return this.qdrantAvailable ? this.qdrant : undefined;
  }

  status() {
    return {
      redis: {
        configured: Boolean(this.configService.get<string>('REDIS_URL')),
        available: this.redisAvailable,
      },
      qdrant: {
        configured: Boolean(this.configService.get<string>('QDRANT_URL')),
        available: this.qdrantAvailable,
      },
    };
  }

  private async initializeRedis() {
    const url = this.configService.get<string>('REDIS_URL');
    if (!url) {
      this.logger.warn(
        'Redis is not configured; cache and queue fallbacks will use local/direct processing where supported',
      );
      return;
    }

    const redis = new Redis(url, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      retryStrategy: () => null,
    });

    redis.on('error', (error) => {
      this.redisAvailable = false;
      this.logger.error(`Redis unavailable: ${error.message}`);
    });

    try {
      await redis.connect();
      await redis.ping();
      this.redis = redis;
      this.redisAvailable = true;
      this.logger.log('Redis connected');
    } catch (error) {
      this.redis = redis;
      this.redisAvailable = false;
      this.logger.error(
        `Redis startup check failed; backend will continue: ${(error as Error).message}`,
      );
    }
  }

  private async initializeQdrant() {
    const url = this.configService.get<string>('QDRANT_URL');
    if (!url) {
      this.logger.warn(
        'Qdrant is not configured; vector matching will fall back to AI when implemented',
      );
      return;
    }

    const client = new QdrantClient({
      url,
      apiKey: this.configService.get<string>('QDRANT_API_KEY') || undefined,
      timeout: 3000,
      checkCompatibility: false,
    });

    try {
      await client.getCollections();
      this.qdrant = client;
      this.qdrantAvailable = true;
      this.logger.log('Qdrant connected');
    } catch (error) {
      this.qdrant = client;
      this.qdrantAvailable = false;
      this.logger.error(
        `Qdrant startup check failed; backend will continue and AI fallback may be used: ${(error as Error).message}`,
      );
    }
  }
}
