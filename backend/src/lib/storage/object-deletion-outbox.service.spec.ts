import { ObjectDeletionOutboxService } from './object-deletion-outbox.service';

describe('ObjectDeletionOutboxService', () => {
  it('enqueues unique object keys using the supplied transaction manager', async () => {
    const save = jest.fn((rows: unknown[]) => Promise.resolve(rows));
    const create = jest.fn((row: unknown) => row);
    const manager = {
      getRepository: jest.fn(() => ({ save, create })),
    } as never;
    const service = new ObjectDeletionOutboxService({} as never, {} as never);

    const result = await service.enqueue(manager, {
      keys: ['a.webp', 'a.webp', ' b.webp '],
      entityType: 'listing',
      entityId: 'listing-1',
      reason: 'listing-deleted',
    });

    expect(result).toHaveLength(2);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('deletes a pending object and marks the outbox row completed', async () => {
    const item = {
      objectKey: 'listing/a.webp',
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
      nextAttemptAt: new Date(),
      completedAt: null,
      lastError: null,
    };
    const repository = {
      find: jest.fn(() => Promise.resolve([item])),
      save: jest.fn((value: unknown) => Promise.resolve(value)),
    };
    const minio = {
      deleteObjects: jest.fn(() =>
        Promise.resolve({ deletedKeys: [item.objectKey] }),
      ),
    };
    const service = new ObjectDeletionOutboxService(
      repository as never,
      minio as never,
    );

    await service.processBatch();

    expect(minio.deleteObjects).toHaveBeenCalledWith([item.objectKey]);
    expect(item.status).toBe('completed');
    expect(item.completedAt).toBeInstanceOf(Date);
  });
});
