import { ConfigService } from '@nestjs/config';
import { MarketplaceCacheService } from './marketplace-cache.service';

const redisUrl = process.env.TEST_REDIS_URL;
const describeRedis = redisUrl ? describe : describe.skip;

describeRedis('Marketplace Redis cache integration', () => {
  it('stores, reads and invalidates marketplace search results', async () => {
    const cache = new MarketplaceCacheService(
      new ConfigService({ REDIS_URL: redisUrl }),
    );
    try {
      await cache.set('search:integration-one', { total: 1 }, 30);
      await cache.set('other:integration-two', { total: 2 }, 30);
      expect(await cache.get('search:integration-one')).toEqual({ total: 1 });
      await cache.invalidateSearches();
      expect(await cache.get('search:integration-one')).toBeNull();
      expect(await cache.get('other:integration-two')).toEqual({ total: 2 });
    } finally {
      await cache.onApplicationShutdown();
    }
  }, 20_000);
});
