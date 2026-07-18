import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class MarketplaceCacheService implements OnApplicationShutdown {
  private readonly redis?: Redis;

  constructor(config: ConfigService) {
    const url = config.get<string>('REDIS_URL');
    if (url)
      this.redis = new Redis(url, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        lazyConnect: true,
      });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    try {
      if (this.redis.status === 'wait') await this.redis.connect();
      const value = await this.redis.get(`marketplace:${key}`);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 60) {
    if (!this.redis) return;
    try {
      if (this.redis.status === 'wait') await this.redis.connect();
      await this.redis.set(
        `marketplace:${key}`,
        JSON.stringify(value),
        'EX',
        ttlSeconds,
      );
    } catch {
      return;
    }
  }

  async invalidateSearches() {
    if (!this.redis) return;
    try {
      if (this.redis.status === 'wait') await this.redis.connect();
      let cursor = '0';
      do {
        const [next, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          'marketplace:search:*',
          'COUNT',
          100,
        );
        cursor = next;
        if (keys.length) await this.redis.del(...keys);
      } while (cursor !== '0');
    } catch {
      return;
    }
  }

  async onApplicationShutdown() {
    if (this.redis) await this.redis.quit().catch(() => undefined);
  }
}
