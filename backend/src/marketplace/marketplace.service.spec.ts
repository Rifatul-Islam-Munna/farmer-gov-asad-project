import { BadRequestException } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';

function repository(overrides: Record<string, unknown> = {}) {
  return {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(() => Promise.resolve([])),
    save: jest.fn((value: unknown) => Promise.resolve(value)),
    create: jest.fn((value: unknown) => value),
    count: jest.fn(() => Promise.resolve(0)),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
    ...overrides,
  };
}

describe('MarketplaceService', () => {
  const product = {
    id: 'product-1',
    sellerId: 'seller-1',
    transactionType: 'rental',
    rentalDailyRate: 100,
    stock: 1,
    restrictedProduct: false,
    requiresLicense: false,
    licenseVerified: false,
    status: 'pending',
  };

  function createService(
    options: {
      productRepository?: ReturnType<typeof repository>;
      rentalRepository?: ReturnType<typeof repository>;
      orderRepository?: ReturnType<typeof repository>;
      bulkRepository?: ReturnType<typeof repository>;
      bulkOfferRepository?: ReturnType<typeof repository>;
      reviewRepository?: ReturnType<typeof repository>;
      aiTaskRepository?: ReturnType<typeof repository>;
      queue?: { add: jest.Mock };
    } = {},
  ) {
    const productRepository =
      options.productRepository ??
      repository({ findOneBy: jest.fn(() => Promise.resolve({ ...product })) });
    const rentalRepository = options.rentalRepository ?? repository();
    return new MarketplaceService(
      { transaction: jest.fn() } as never,
      productRepository as never,
      repository() as never,
      repository() as never,
      repository() as never,
      (options.orderRepository ?? repository()) as never,
      rentalRepository as never,
      (options.bulkRepository ?? repository()) as never,
      (options.bulkOfferRepository ?? repository()) as never,
      repository() as never,
      repository() as never,
      repository() as never,
      (options.reviewRepository ?? repository()) as never,
      (options.aiTaskRepository ?? repository()) as never,
      {
        get: jest.fn(),
        set: jest.fn(),
        invalidateSearches: jest.fn(),
      } as never,
      (options.queue ?? { add: jest.fn() }) as never,
    );
  }

  it('rejects an overlapping rental period', async () => {
    const query = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(() => Promise.resolve({ id: 'existing-booking' })),
    };
    const rentals = repository({ createQueryBuilder: jest.fn(() => query) });
    const service = createService({ rentalRepository: rentals });

    await expect(
      service.bookRental('renter-1', {
        productId: 'product-1',
        startsAt: '2026-08-01T00:00:00.000Z',
        endsAt: '2026-08-03T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('requires a verified license before publishing a restricted product', async () => {
    const products = repository({
      findOneBy: jest.fn(() =>
        Promise.resolve({
          ...product,
          restrictedProduct: true,
          requiresLicense: true,
        }),
      ),
    });
    const service = createService({ productRepository: products });

    await expect(
      service.moderate('admin-1', 'product-1', {
        status: 'published',
        reason: 'Documentation review',
        licenseVerified: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns review aggregates and rating distribution', async () => {
    const reviews = repository({
      find: jest.fn(() =>
        Promise.resolve([
          { id: 'r1', rating: 5, status: 'published' },
          { id: 'r2', rating: 3, status: 'published' },
        ]),
      ),
    });
    const service = createService({ reviewRepository: reviews });

    const result = await service.listProductReviews('product-1');

    expect(result.aggregate).toEqual({
      average: 4,
      count: 2,
      distribution: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 1 },
    });
  });

  it('persists and queues provider-backed description generation', async () => {
    const aiTasks = repository();
    const queue = { add: jest.fn(() => Promise.resolve({ id: 'job-1' })) };
    const service = createService({ aiTaskRepository: aiTasks, queue });

    const task = await service.descriptionDraft('product-1', 'seller-1');

    expect(task).toMatchObject({
      productId: 'product-1',
      requestedBy: 'seller-1',
      type: 'description-generation',
      status: 'queued',
    });
    expect(queue.add).toHaveBeenCalledTimes(1);
    const call = queue.add.mock.calls[0] as [
      string,
      string,
      Record<string, unknown>,
      { jobId: string },
    ];
    expect(call[0]).toBe('ai');
    expect(call[1]).toBe('marketplace-description-generate');
    expect(call[2].productId).toBe('product-1');
    expect(call[3].jobId).toContain('marketplace-description:');
  });

  it('accepts and persists a seller offer for an open bulk request', async () => {
    const bulk = repository({
      findOneBy: jest.fn(() =>
        Promise.resolve({ id: 'bulk-1', buyerId: 'buyer-1', status: 'open' }),
      ),
    });
    const offers = repository({
      findOne: jest.fn(() => Promise.resolve(null)),
    });
    const service = createService({
      bulkRepository: bulk,
      bulkOfferRepository: offers,
    });

    const result = await service.submitBulkOffer('seller-1', 'bulk-1', {
      unitPrice: 25,
      availableQuantity: 100,
      unit: 'kg',
      deliveryDays: 3,
      note: 'Fresh stock',
    });

    expect(result).toMatchObject({
      requestId: 'bulk-1',
      sellerId: 'seller-1',
      unitPrice: 25,
      availableQuantity: 100,
      status: 'submitted',
    });
  });

  it('persists moderation reason, reviewer and license approval', async () => {
    const products = repository({
      findOneBy: jest.fn(() =>
        Promise.resolve({
          ...product,
          restrictedProduct: true,
          requiresLicense: true,
        }),
      ),
    });
    const service = createService({ productRepository: products });

    const result = await service.moderate('admin-1', 'product-1', {
      status: 'published',
      reason: 'License verified against submitted document',
      licenseVerified: true,
    });

    expect(result).toMatchObject({
      status: 'published',
      moderationReason: 'License verified against submitted document',
      moderatedBy: 'admin-1',
      licenseVerified: true,
    });
  });
});
