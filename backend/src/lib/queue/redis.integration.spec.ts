import { Job, Queue, QueueEvents, Worker } from 'bullmq';

type Payload = { value: number };
type Result = { persisted: boolean; value: number };

const redisUrl = process.env.TEST_REDIS_URL;
const describeRedis = redisUrl ? describe : describe.skip;

describeRedis('BullMQ real Redis integration', () => {
  it('enqueues and completes a job using the configured Redis instance', async () => {
    const parsed = new URL(redisUrl!);
    const connection = {
      host: parsed.hostname,
      port: Number(parsed.port || 6379),
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      tls: parsed.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
    };
    const queueName = `integration-${Date.now()}`;
    const queue = new Queue<Payload, Result>(queueName, { connection });
    const queueEvents = new QueueEvents(queueName, { connection });
    await queueEvents.waitUntilReady();
    const worker = new Worker<Payload, Result>(
      queueName,
      (job: Job<Payload, Result>) =>
        Promise.resolve({ persisted: true, value: job.data.value }),
      { connection },
    );

    try {
      const job = await queue.add(
        'persist-test',
        { value: 42 },
        { attempts: 2 },
      );
      const result: Result = await job.waitUntilFinished(queueEvents, 10_000);
      expect(result).toEqual({ persisted: true, value: 42 });
    } finally {
      await worker.close();
      await queue.drain(true);
      await queueEvents.close();
      await queue.close();
    }
  }, 20_000);
});
