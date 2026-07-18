import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue, Worker } from 'bullmq';
import { DataSource, Repository } from 'typeorm';
import { ImageProfile } from '../../admin/entities/image-profile.entity';
import { Alert } from '../../alerts/entities/alert.entity';
import { MarketplaceAiTask } from '../../marketplace/entities/marketplace-ai-task.entity';
import { WorkerJobRecord } from './entities/worker-job-record.entity';

type WorkerPayload = Record<string, unknown>;

type WorkerStatus = {
  queue: string;
  available: boolean;
  running: boolean;
  processed: number;
  failed: number;
  lastHeartbeatAt?: string;
  lastJobAt?: string;
  lastError?: string;
};

@Injectable()
export class FeatureWorkersService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(FeatureWorkersService.name);
  private readonly workers: Worker<WorkerPayload>[] = [];
  private readonly deadLetterQueues = new Map<string, Queue<WorkerPayload>>();
  private readonly statuses = new Map<string, WorkerStatus>();
  private heartbeat?: NodeJS.Timeout;

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    @InjectRepository(WorkerJobRecord)
    private readonly recordRepository: Repository<WorkerJobRecord>,
  ) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    for (const queue of ['ai', 'notifications', 'media', 'reports']) {
      this.statuses.set(queue, {
        queue,
        available: Boolean(redisUrl),
        running: false,
        processed: 0,
        failed: 0,
      });
    }
    if (!redisUrl) {
      this.logger.warn(
        'Feature workers disabled because Redis is not configured',
      );
      return;
    }

    const connection = this.connection(redisUrl);
    for (const queueName of ['ai', 'notifications', 'media', 'reports']) {
      const deadLetterQueue = new Queue<WorkerPayload>(
        `${queueName}-dead-letter`,
        { connection },
      );
      this.deadLetterQueues.set(queueName, deadLetterQueue);
      const worker = new Worker<WorkerPayload>(
        queueName,
        (job) => this.process(queueName, job),
        {
          connection,
          concurrency: Number(
            this.configService.get<string>(
              `WORKER_${queueName.toUpperCase()}_CONCURRENCY`,
              '2',
            ),
          ),
          autorun: true,
        },
      );
      worker.on('ready', () => {
        this.patchStatus(queueName, { available: true, running: true });
      });
      worker.on('completed', () => {
        const current = this.statuses.get(queueName)!;
        this.patchStatus(queueName, {
          processed: current.processed + 1,
          lastJobAt: new Date().toISOString(),
          lastError: undefined,
        });
      });
      worker.on('failed', (job, error) => {
        void this.handleFailure(queueName, deadLetterQueue, job, error);
      });
      worker.on('error', (error) => {
        this.patchStatus(queueName, {
          available: false,
          running: false,
          lastError: error.message,
        });
      });
      this.workers.push(worker);
    }

    this.heartbeat = setInterval(() => {
      const now = new Date().toISOString();
      for (const worker of this.workers) {
        this.patchStatus(worker.name, {
          running: !worker.closing,
          lastHeartbeatAt: now,
        });
      }
    }, 15_000);
    this.heartbeat.unref();
  }

  status() {
    return [...this.statuses.values()];
  }

  prometheusMetrics() {
    const lines = [
      '# HELP agrivision_worker_running Whether a feature worker is running.',
      '# TYPE agrivision_worker_running gauge',
      '# HELP agrivision_worker_processed_total Completed feature jobs.',
      '# TYPE agrivision_worker_processed_total counter',
      '# HELP agrivision_worker_failed_total Failed feature jobs.',
      '# TYPE agrivision_worker_failed_total counter',
      '# HELP agrivision_worker_heartbeat_timestamp_seconds Last worker heartbeat.',
      '# TYPE agrivision_worker_heartbeat_timestamp_seconds gauge',
    ];
    for (const status of this.statuses.values()) {
      const labels = `{queue="${status.queue}"}`;
      lines.push(
        `agrivision_worker_running${labels} ${status.running ? 1 : 0}`,
        `agrivision_worker_processed_total${labels} ${status.processed}`,
        `agrivision_worker_failed_total${labels} ${status.failed}`,
        `agrivision_worker_heartbeat_timestamp_seconds${labels} ${
          status.lastHeartbeatAt
            ? Math.floor(new Date(status.lastHeartbeatAt).getTime() / 1000)
            : 0
        }`,
      );
    }
    return `${lines.join('\n')}\n`;
  }

  async onApplicationShutdown() {
    if (this.heartbeat) clearInterval(this.heartbeat);
    await Promise.allSettled([
      ...this.workers.map((worker) => worker.close()),
      ...[...this.deadLetterQueues.values()].map((queue) => queue.close()),
    ]);
  }

  private async process(queueName: string, job: Job<WorkerPayload>) {
    const jobId = String(job.id ?? `${queueName}:${job.name}`);
    const existing = await this.recordRepository.findOne({
      where: { queueName, jobId },
    });
    if (existing?.status === 'completed') return existing.result;

    const record = await this.recordRepository.save(
      this.recordRepository.create({
        ...(existing ?? {}),
        queueName,
        jobName: job.name,
        jobId,
        status: 'processing',
        payload: job.data,
        attemptsMade: job.attemptsMade,
        error: null,
      }),
    );

    try {
      const result = await this.dataSource.transaction(async (manager) => {
        switch (`${queueName}:${job.name}`) {
          case 'media:image-profile-process-batch': {
            const profileId = this.requiredString(job.data.imageProfileId);
            const itemIds = Array.isArray(job.data.itemIds)
              ? job.data.itemIds.filter(
                  (value): value is string => typeof value === 'string',
                )
              : [];
            const repository = manager.getRepository(ImageProfile);
            const profile = await repository.findOneByOrFail({ id: profileId });
            const selected = new Set(itemIds);
            profile.items = profile.items.map((item) =>
              selected.has(item.id) && item.status === 'pending'
                ? {
                    ...item,
                    status: 'ready' as const,
                    thumbnailKey:
                      item.thumbnailKey ?? `${item.objectKey}.thumbnail.webp`,
                    qualityScore:
                      item.qualityScore ??
                      Math.max(0.5, Math.min(1, item.sizeBytes / 2_000_000)),
                    error: undefined,
                  }
                : item,
            );
            profile.readyCount = profile.items.filter(
              (item) => item.status === 'ready',
            ).length;
            profile.failedCount = profile.items.filter(
              (item) => item.status === 'failed',
            ).length;
            profile.duplicateCount = profile.items.filter(
              (item) => item.status === 'duplicate',
            ).length;
            profile.status = profile.failedCount > 0 ? 'failed' : 'processing';
            profile.lastError =
              profile.failedCount > 0 ? 'One or more media items failed' : null;
            await repository.save(profile);
            return {
              imageProfileId: profile.id,
              processedItemIds: itemIds,
              readyCount: profile.readyCount,
            };
          }
          case 'ai:image-profile-reindex': {
            const profileId = this.requiredString(job.data.imageProfileId);
            const repository = manager.getRepository(ImageProfile);
            const profile = await repository.findOneByOrFail({ id: profileId });
            profile.embeddingProvider =
              profile.embeddingProvider ?? 'configured-provider';
            profile.embeddingModel =
              profile.embeddingModel ?? 'configured-model';
            profile.qdrantCollection =
              profile.qdrantCollection ?? `image-profile-${profile.code}`;
            profile.lastIndexedAt = new Date();
            profile.lastError = null;
            profile.status = profile.readyCount >= 10 ? 'active' : 'processing';
            await repository.save(profile);
            return {
              imageProfileId: profile.id,
              version: profile.version,
              qdrantCollection: profile.qdrantCollection,
              indexedItemCount: profile.readyCount,
              status: profile.status,
            };
          }
          case 'ai:marketplace-description-generate': {
            const taskId = this.requiredString(job.data.taskId);
            const repository = manager.getRepository(MarketplaceAiTask);
            const task = await repository.findOneByOrFail({ id: taskId });
            task.status = 'processing';
            await repository.save(task);
            try {
              const endpoint = this.configService.get<string>(
                'MARKETPLACE_TEXT_PROVIDER_URL',
              );
              const apiKey = this.configService.get<string>(
                'MARKETPLACE_TEXT_PROVIDER_API_KEY',
              );
              const model = this.configService.get<string>(
                'MARKETPLACE_TEXT_PROVIDER_MODEL',
                'configured-model',
              );
              if (!endpoint || !apiKey) {
                throw new Error('Marketplace text provider is not configured');
              }
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                  authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                  model,
                  task: 'agricultural-marketplace-description',
                  input: task.input,
                  requirements: {
                    language: 'Bangla and simple English where useful',
                    includeUseCases: true,
                    includeSafety: true,
                    avoidUnsupportedClaims: true,
                  },
                }),
                signal: AbortSignal.timeout(30_000),
              });
              if (!response.ok) {
                throw new Error(
                  `Description provider returned HTTP ${response.status}`,
                );
              }
              const payload = (await response.json()) as Record<
                string,
                unknown
              >;
              const description =
                this.stringValue(payload.description) ||
                this.stringValue(payload.text) ||
                this.stringValue(payload.outputText);
              if (!description) {
                throw new Error('Description provider returned no text');
              }
              task.status = 'completed';
              task.output = { description };
              task.provider = new URL(endpoint).hostname;
              task.model = model;
              task.completedAt = new Date();
              task.error = null;
              await repository.save(task);
              return { taskId, description, provider: task.provider, model };
            } catch (error) {
              task.status = 'failed';
              task.error =
                error instanceof Error
                  ? error.message
                  : 'Description generation failed';
              await repository.save(task);
              throw error;
            }
          }
          case 'media:marketplace-background-remove': {
            const taskId = this.requiredString(job.data.taskId);
            const imageUrl = this.requiredString(job.data.imageUrl);
            const repository = manager.getRepository(MarketplaceAiTask);
            const task = await repository.findOneByOrFail({ id: taskId });
            task.status = 'processing';
            await repository.save(task);
            try {
              const endpoint = this.configService.get<string>(
                'IMAGE_EDIT_PROVIDER_URL',
              );
              const apiKey = this.configService.get<string>(
                'IMAGE_EDIT_PROVIDER_API_KEY',
              );
              if (!endpoint || !apiKey) {
                throw new Error('Image-edit provider is not configured');
              }
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                  authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                  imageUrl,
                  operation: 'remove-background',
                  outputFormat: 'webp',
                }),
                signal: AbortSignal.timeout(60_000),
              });
              if (!response.ok) {
                throw new Error(
                  `Image-edit provider returned HTTP ${response.status}`,
                );
              }
              const payload = (await response.json()) as Record<
                string,
                unknown
              >;
              const outputUrl =
                this.stringValue(payload.outputUrl) ||
                this.stringValue(payload.url) ||
                this.stringValue(payload.resultUrl);
              if (!outputUrl) {
                throw new Error('Image-edit provider returned no output URL');
              }
              task.status = 'completed';
              task.output = { outputUrl };
              task.provider = new URL(endpoint).hostname;
              task.model = this.stringValue(payload.model) || null;
              task.completedAt = new Date();
              task.error = null;
              await repository.save(task);
              return { taskId, outputUrl, provider: task.provider };
            } catch (error) {
              task.status = 'failed';
              task.error =
                error instanceof Error ? error.message : 'Image editing failed';
              await repository.save(task);
              throw error;
            }
          }
          case 'notifications:send-alert': {
            const alertId = this.requiredString(job.data.alertId);
            const repository = manager.getRepository(Alert);
            const alert = await repository.findOneByOrFail({ id: alertId });
            alert.data = {
              ...alert.data,
              deliveryStatus: 'sent',
              deliveryChannel: this.stringValue(job.data.channel) || 'in-app',
              sentAt: new Date().toISOString(),
              workerJobId: jobId,
            };
            await repository.save(alert);
            return {
              alertId: alert.id,
              userId: alert.userId,
              deliveryStatus: 'sent',
            };
          }
          case 'reports:generate-report': {
            const reportId = this.requiredString(job.data.reportId);
            const generatedAt = new Date().toISOString();
            const filters = this.objectValue(job.data.filters);
            const report = {
              reportId,
              generatedAt,
              format: this.stringValue(job.data.format) || 'json',
              filters,
              summary: {
                filterCount: Object.keys(filters).length,
                requestedBy: this.stringValue(job.data.requestedBy),
              },
            };
            return report;
          }
          default:
            throw new Error(
              `No processor registered for ${queueName}:${job.name}`,
            );
        }
      });

      record.status = 'completed';
      record.result = result;
      record.completedAt = new Date();
      record.attemptsMade = job.attemptsMade;
      await this.recordRepository.save(record);
      return result;
    } catch (error) {
      record.status = 'failed';
      record.error =
        error instanceof Error ? error.message : 'Unknown worker error';
      record.attemptsMade = job.attemptsMade;
      await this.recordRepository.save(record);
      throw error;
    }
  }

  private async handleFailure(
    queueName: string,
    deadLetterQueue: Queue<WorkerPayload>,
    job: Job<WorkerPayload> | undefined,
    error: Error,
  ) {
    const current = this.statuses.get(queueName)!;
    this.patchStatus(queueName, {
      failed: current.failed + 1,
      lastJobAt: new Date().toISOString(),
      lastError: error.message,
    });
    if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
      await deadLetterQueue.add(
        job.name,
        {
          originalQueue: queueName,
          originalJobId: job.id ?? '',
          payload: job.data,
          error: error.message,
          failedAt: new Date().toISOString(),
        },
        {
          jobId: `dlq:${queueName}:${job.id ?? 'unknown'}`,
          removeOnComplete: { age: 30 * 24 * 60 * 60, count: 10000 },
        },
      );
    }
  }

  private patchStatus(queue: string, patch: Partial<WorkerStatus>) {
    this.statuses.set(queue, {
      ...(this.statuses.get(queue) ?? {
        queue,
        available: false,
        running: false,
        processed: 0,
        failed: 0,
      }),
      ...patch,
    });
  }

  private connection(redisUrl: string) {
    const parsed = new URL(redisUrl);
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 6379),
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      tls: parsed.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      connectTimeout: 3000,
    };
  }

  private requiredString(value: unknown) {
    const result = this.stringValue(value);
    if (!result) throw new Error('Required worker payload value is missing');
    return result;
  }

  private stringValue(value: unknown) {
    return typeof value === 'string' ? value : '';
  }

  private objectValue(value: unknown) {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }
}
