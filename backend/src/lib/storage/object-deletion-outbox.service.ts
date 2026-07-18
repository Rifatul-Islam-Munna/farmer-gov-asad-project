import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThanOrEqual, Repository } from 'typeorm';
import { MinioService } from './minio.service';
import { ObjectDeletionOutbox } from './entities/object-deletion-outbox.entity';

@Injectable()
export class ObjectDeletionOutboxService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(ObjectDeletionOutboxService.name);
  private timer?: NodeJS.Timeout;

  constructor(
    @InjectRepository(ObjectDeletionOutbox)
    private readonly repository: Repository<ObjectDeletionOutbox>,
    private readonly minio: MinioService,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.processBatch(), 10_000);
    this.timer.unref();
  }

  onApplicationShutdown() {
    if (this.timer) clearInterval(this.timer);
  }

  async enqueue(
    manager: EntityManager,
    input: {
      keys: string[];
      entityType: string;
      entityId?: string;
      reason: string;
    },
  ) {
    const keys = [
      ...new Set(input.keys.map((key) => key.trim()).filter(Boolean)),
    ];
    if (!keys.length) return [];
    return manager.getRepository(ObjectDeletionOutbox).save(
      keys.map((objectKey) =>
        manager.getRepository(ObjectDeletionOutbox).create({
          objectKey,
          entityType: input.entityType,
          entityId: input.entityId,
          reason: input.reason,
          status: 'pending',
          attempts: 0,
          nextAttemptAt: new Date(),
        }),
      ),
    );
  }

  async processBatch(limit = 25) {
    const pending = await this.repository.find({
      where: {
        status: 'pending',
        nextAttemptAt: LessThanOrEqual(new Date()),
      },
      order: { createdAt: 'ASC' },
      take: limit,
    });

    for (const item of pending) {
      item.status = 'processing';
      item.attempts += 1;
      await this.repository.save(item);
      try {
        await this.minio.deleteObjects([item.objectKey]);
        item.status = 'completed';
        item.completedAt = new Date();
        item.lastError = null;
      } catch (error) {
        item.status = item.attempts >= 10 ? 'failed' : 'pending';
        item.lastError =
          error instanceof Error ? error.message : 'Unknown deletion error';
        item.nextAttemptAt = new Date(
          Date.now() + Math.min(60 * 60_000, 2 ** item.attempts * 1_000),
        );
        this.logger.warn(
          `Object deletion failed for ${item.objectKey}: ${item.lastError}`,
        );
      }
      await this.repository.save(item);
    }
    return { processed: pending.length };
  }
}
