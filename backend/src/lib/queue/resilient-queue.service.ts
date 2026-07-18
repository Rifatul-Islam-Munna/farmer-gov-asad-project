import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, JobsOptions, Queue } from 'bullmq';

export type QueueJobPayload = Record<string, unknown>;

@Injectable()
export class ResilientQueueService implements OnApplicationShutdown {
  private readonly logger = new Logger(ResilientQueueService.name);
  private readonly queues = new Map<string, Queue>();

  constructor(private readonly configService: ConfigService) {}

  async add(
    queueName: string,
    jobName: string,
    payload: QueueJobPayload,
    options: JobsOptions = {},
  ): Promise<Job | { queued: false; reason: string }> {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.error(
        `Queue '${queueName}' skipped because Redis is not configured`,
      );
      return { queued: false, reason: 'redis-not-configured' };
    }

    try {
      const queue = this.getQueue(queueName, redisUrl);
      return await queue.add(jobName, payload, {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 24 * 60 * 60, count: 1000 },
        removeOnFail: { age: 7 * 24 * 60 * 60, count: 5000 },
        ...options,
      });
    } catch (error) {
      this.logger.error(
        `Queue '${queueName}' unavailable; request will continue without enqueue: ${(error as Error).message}`,
      );
      return { queued: false, reason: 'redis-unavailable' };
    }
  }

  async onApplicationShutdown() {
    await Promise.allSettled(
      [...this.queues.values()].map((queue) => queue.close()),
    );
  }

  private getQueue(name: string, redisUrl: string) {
    const existing = this.queues.get(name);
    if (existing) return existing;

    const parsed = new URL(redisUrl);
    const queue = new Queue(name, {
      connection: {
        host: parsed.hostname,
        port: Number(parsed.port || 6379),
        username: parsed.username || undefined,
        password: parsed.password || undefined,
        tls: parsed.protocol === 'rediss:' ? {} : undefined,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        connectTimeout: 3000,
      },
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
      },
    });
    queue.on('error', (error) => {
      this.logger.error(`Queue '${name}' error: ${error.message}`);
    });
    this.queues.set(name, queue);
    return queue;
  }
}
