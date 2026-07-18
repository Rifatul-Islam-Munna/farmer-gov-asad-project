import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, IsNull, Repository } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { MarketplaceCacheService } from './marketplace-cache.service';
import { ResilientQueueService } from '../lib/queue/resilient-queue.service';
import { MarketplaceAiTask } from './entities/marketplace-ai-task.entity';
import { UserType } from '../user/entities/user.entity';
import {
  AppealDto,
  AuctionDto,
  BidDto,
  BulkOfferDto,
  BulkRequestDto,
  CartItemDto,
  CheckoutDto,
  CreateMarketplaceProductDto,
  MarketplaceSearchDto,
  MessageDto,
  ModerateProductDto,
  RentalBookingDto,
  ReviewDto,
  SavedSearchDto,
  VoiceSearchDto,
} from './dto/marketplace.dto';
import {
  MarketplaceAuction,
  MarketplaceBid,
  MarketplaceBulkOffer,
  MarketplaceBulkRequest,
  MarketplaceCartItem,
  MarketplaceFavorite,
  MarketplaceMessage,
  MarketplaceOrder,
  MarketplaceProduct,
  MarketplaceRentalBooking,
  MarketplaceReview,
  MarketplaceSavedSearch,
} from './entities/marketplace.entity';

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(MarketplaceProduct)
    private readonly products: Repository<MarketplaceProduct>,
    @InjectRepository(MarketplaceFavorite)
    private readonly favorites: Repository<MarketplaceFavorite>,
    @InjectRepository(MarketplaceSavedSearch)
    private readonly searches: Repository<MarketplaceSavedSearch>,
    @InjectRepository(MarketplaceCartItem)
    private readonly cart: Repository<MarketplaceCartItem>,
    @InjectRepository(MarketplaceOrder)
    private readonly orders: Repository<MarketplaceOrder>,
    @InjectRepository(MarketplaceRentalBooking)
    private readonly rentals: Repository<MarketplaceRentalBooking>,
    @InjectRepository(MarketplaceBulkRequest)
    private readonly bulk: Repository<MarketplaceBulkRequest>,
    @InjectRepository(MarketplaceBulkOffer)
    private readonly bulkOffers: Repository<MarketplaceBulkOffer>,
    @InjectRepository(MarketplaceAuction)
    private readonly auctions: Repository<MarketplaceAuction>,
    @InjectRepository(MarketplaceBid)
    private readonly bids: Repository<MarketplaceBid>,
    @InjectRepository(MarketplaceMessage)
    private readonly messages: Repository<MarketplaceMessage>,
    @InjectRepository(MarketplaceReview)
    private readonly reviews: Repository<MarketplaceReview>,
    @InjectRepository(MarketplaceAiTask)
    private readonly aiTasks: Repository<MarketplaceAiTask>,
    private readonly cache: MarketplaceCacheService,
    private readonly queue: ResilientQueueService,
  ) {}

  async createProduct(sellerId: string, dto: CreateMarketplaceProductDto) {
    const product = await this.products.save(
      this.products.create({
        ...dto,
        sellerId,
        imageUrls: dto.imageUrls ?? [],
        specifications: dto.specifications ?? {},
        transactionType: dto.transactionType ?? 'sale',
        status: 'pending',
      }),
    );
    await this.cache.invalidateSearches();
    return product;
  }

  getProduct(id: string) {
    return this.product(id);
  }

  listSellerProducts(sellerId: string) {
    return this.products.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  adminProducts() {
    return this.products.find({ order: { createdAt: 'DESC' }, take: 500 });
  }

  adminOrders() {
    return this.orders.find({ order: { createdAt: 'DESC' }, take: 500 });
  }

  async search(dto: MarketplaceSearchDto) {
    const cacheKey = `search:${createHash('sha256')
      .update(JSON.stringify(dto))
      .digest('hex')}`;
    const cached = await this.cache.get<{
      items: MarketplaceProduct[];
      total: number;
      page: number;
      limit: number;
    }>(cacheKey);
    if (cached) return { ...cached, cached: true };
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const qb = this.products
      .createQueryBuilder('p')
      .where('p.status = :status', { status: 'published' });
    if (dto.q)
      qb.andWhere(
        new Brackets((b) =>
          b
            .where(
              `to_tsvector('simple', coalesce(p.title,'') || ' ' || coalesce(p.description,'') || ' ' || coalesce(p."useCases",'') || ' ' || coalesce(p.symptoms,'')) @@ plainto_tsquery('simple', :q)`,
              { q: dto.q },
            )
            .orWhere('p.title ILIKE :like OR p.description ILIKE :like', {
              like: `%${dto.q}%`,
            }),
        ),
      );
    if (dto.categoryCode)
      qb.andWhere('p.categoryCode = :categoryCode', {
        categoryCode: dto.categoryCode,
      });
    if (dto.transactionType)
      qb.andWhere('p.transactionType = :transactionType', {
        transactionType: dto.transactionType,
      });
    if (dto.minPrice !== undefined)
      qb.andWhere('p.price >= :minPrice', { minPrice: dto.minPrice });
    if (dto.maxPrice !== undefined)
      qb.andWhere('p.price <= :maxPrice', { maxPrice: dto.maxPrice });
    let distanceSql = '';
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      distanceSql = `(6371 * acos(least(1, cos(radians(:lat)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(:lon)) + sin(radians(:lat)) * sin(radians(p.latitude)))))`;
      qb.addSelect(distanceSql, 'distance').setParameters({
        lat: dto.latitude,
        lon: dto.longitude,
      });
      if (dto.radiusKm)
        qb.andWhere(`${distanceSql} <= :radiusKm`, { radiusKm: dto.radiusKm });
    }
    if (dto.sort === 'priceAsc') qb.orderBy('p.price', 'ASC');
    else if (dto.sort === 'priceDesc') qb.orderBy('p.price', 'DESC');
    else if (dto.sort === 'distance' && distanceSql)
      qb.orderBy('distance', 'ASC');
    else qb.orderBy('p.createdAt', 'DESC');
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    const result = { items, total, page, limit };
    await this.cache.set(cacheKey, result, 60);
    return result;
  }

  voiceSearch(dto: VoiceSearchDto) {
    return this.search({
      q: this.normalizeVoice(dto.transcript),
      page: 1,
      limit: 20,
      sort: 'relevance',
    });
  }
  async recommend(q: string) {
    const products = await this.products.find({
      where: { status: 'published' },
      order: { soldCount: 'DESC', createdAt: 'DESC' },
      take: 200,
    });
    const queryTokens = this.tokenize(q);
    const scored = products
      .map((product) => {
        const searchable = this.tokenize([
          product.title,
          product.description,
          product.categoryCode,
          product.useCases,
          product.symptoms,
          product.machineryBrand,
          product.machineryModel,
        ].filter(Boolean).join(' '));
        const overlap = queryTokens.filter((token) => searchable.includes(token));
        const textScore = queryTokens.length
          ? overlap.length / queryTokens.length
          : 0;
        const popularityScore = Math.min(1, product.soldCount / 100);
        const availabilityScore = product.stock > 0 || product.transactionType !== 'sale' ? 1 : 0;
        const recencyDays = Math.max(
          0,
          (Date.now() - product.createdAt.getTime()) / 86_400_000,
        );
        const recencyScore = Math.max(0, 1 - recencyDays / 180);
        const score =
          textScore * 0.6 +
          popularityScore * 0.2 +
          availabilityScore * 0.15 +
          recencyScore * 0.05;
        return {
          product,
          score,
          reasons: [
            ...(overlap.length ? [`Matched: ${overlap.slice(0, 4).join(', ')}`] : []),
            ...(product.soldCount > 0 ? ['Popular with buyers'] : []),
            ...(availabilityScore ? ['Currently available'] : []),
            ...(recencyScore > 0.7 ? ['Recently listed'] : []),
          ],
        };
      })
      .filter((item) => item.score > 0 || !queryTokens.length)
      .sort((a, b) => b.score - a.score || b.product.soldCount - a.product.soldCount)
      .slice(0, 12);

    return {
      items: scored.map((item) => ({
        ...item.product,
        recommendationScore: Number(item.score.toFixed(4)),
        recommendationReasons: item.reasons,
      })),
      strategy: 'explainable-content-popularity-ranking',
      evaluation: {
        catalogOnly: true,
        inventedItems: 0,
        candidatesEvaluated: products.length,
        queryTokenCount: queryTokens.length,
      },
      aiUsed: false,
    };
  }

  async toggleFavorite(userId: string, productId: string) {
    const existing = await this.favorites.findOne({
      where: { userId, productId },
    });
    if (existing) {
      await this.favorites.remove(existing);
      return { favorite: false };
    }
    await this.favorites.save(this.favorites.create({ userId, productId }));
    return { favorite: true };
  }
  async listFavorites(userId: string) {
    const favorites = await this.favorites.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    if (!favorites.length) return [];
    const products = await this.products.findBy({
      id: In(favorites.map((favorite) => favorite.productId)),
    });
    const byId = new Map(products.map((product) => [product.id, product]));
    return favorites
      .map((favorite) => ({
        ...favorite,
        product: byId.get(favorite.productId) ?? null,
      }))
      .filter((favorite) => favorite.product !== null);
  }
  saveSearch(userId: string, dto: SavedSearchDto) {
    return this.searches.save(this.searches.create({ userId, ...dto }));
  }
  listSearches(userId: string) {
    return this.searches.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
  async deleteSavedSearch(userId: string, searchId: string) {
    const search = await this.searches.findOne({ where: { id: searchId, userId } });
    if (!search) throw new NotFoundException('Saved search not found');
    await this.searches.remove(search);
    return { deleted: true };
  }

  async putCart(userId: string, dto: CartItemDto) {
    const product = await this.product(dto.productId);
    if (product.stock < dto.quantity || product.transactionType !== 'sale')
      throw new BadRequestException('Requested quantity is unavailable');
    const existing = await this.cart.findOne({
      where: { userId, productId: dto.productId },
    });
    return this.cart.save(
      this.cart.create({
        ...(existing ?? {}),
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      }),
    );
  }
  listCart(userId: string) {
    return this.cart.find({ where: { userId }, order: { createdAt: 'ASC' } });
  }
  removeCart(userId: string, productId: string) {
    return this.cart.delete({ userId, productId });
  }

  async checkout(userId: string, dto: CheckoutDto) {
    return this.dataSource.transaction(async (manager) => {
      const items = await manager
        .getRepository(MarketplaceCartItem)
        .find({ where: { userId } });
      if (!items.length) throw new BadRequestException('Cart is empty');
      const lines = [] as MarketplaceOrder['items'];
      for (const item of items) {
        const product = await manager
          .getRepository(MarketplaceProduct)
          .findOne({
            where: { id: item.productId },
            lock: { mode: 'pessimistic_write' },
          });
        if (
          !product ||
          product.status !== 'published' ||
          product.stock < item.quantity
        )
          throw new BadRequestException('A cart item is unavailable');
        product.stock -= item.quantity;
        await manager.save(product);
        lines.push({
          productId: product.id,
          sellerId: product.sellerId,
          title: product.title,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal: product.price * item.quantity,
        });
      }
      const subtotal = lines.reduce((sum, item) => sum + item.subtotal, 0);
      const order = await manager.save(
        manager.create(MarketplaceOrder, {
          orderNumber: `AG-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`,
          buyerId: userId,
          items: lines,
          subtotal,
          deliveryFee: 0,
          total: subtotal,
          deliveryAddress: dto.deliveryAddress,
          paymentProvider: dto.paymentProvider ?? null,
          paymentStatus: dto.paymentProvider ? 'pending' : 'unpaid',
          status: 'pending',
        }),
      );
      await manager.delete(MarketplaceCartItem, { userId });
      return order;
    });
  }
  listOrders(userId: string) {
    return this.orders.find({
      where: { buyerId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  getOrderForSignedInvoice(orderId: string) {
    return this.orders.findOneBy({ id: orderId }).then((order) => {
      if (!order) throw new NotFoundException('Order not found');
      return order;
    });
  }

  async findOrderForInvoice(
    orderId: string,
    requesterId: string,
    roles: UserType[],
  ) {
    const order = await this.orders.findOneBy({ id: orderId });
    if (!order) throw new NotFoundException('Order not found');
    const isAdmin = roles.some((role) =>
      [UserType.ADMIN, UserType.SUPER_ADMIN].includes(role),
    );
    const isBuyer = order.buyerId === requesterId;
    const isSeller = order.items.some((item) => item.sellerId === requesterId);
    if (!isAdmin && !isBuyer && !isSeller) throw new ForbiddenException();
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: MarketplaceOrder['status'],
    trackingNumber?: string,
  ) {
    const order = await this.orders.findOneByOrFail({ id: orderId });
    order.status = status;
    order.trackingNumber = trackingNumber ?? order.trackingNumber;
    if (status === 'delivered')
      order.invoiceUrl = `/marketplace/orders/${order.id}/invoice`;
    return this.orders.save(order);
  }

  async bookRental(userId: string, dto: RentalBookingDto) {
    const product = await this.product(dto.productId);
    if (product.transactionType !== 'rental' || !product.rentalDailyRate)
      throw new BadRequestException('Product is not rentable');
    const startsAt = new Date(dto.startsAt),
      endsAt = new Date(dto.endsAt);
    if (endsAt <= startsAt)
      throw new BadRequestException('Invalid rental period');
    const conflict = await this.rentals
      .createQueryBuilder('r')
      .where('r.productId = :id', { id: product.id })
      .andWhere("r.status IN ('pending','confirmed')")
      .andWhere('r.startsAt < :endsAt AND r.endsAt > :startsAt', {
        startsAt,
        endsAt,
      })
      .getOne();
    if (conflict)
      throw new BadRequestException(
        'Rental period conflicts with another booking',
      );
    const days = Math.max(
      1,
      Math.ceil((endsAt.getTime() - startsAt.getTime()) / 86400000),
    );
    return this.rentals.save(
      this.rentals.create({
        productId: product.id,
        renterId: userId,
        startsAt,
        endsAt,
        total: days * product.rentalDailyRate,
        status: 'pending',
      }),
    );
  }
  createBulk(userId: string, dto: BulkRequestDto) {
    return this.bulk.save(
      this.bulk.create({
        buyerId: userId,
        ...dto,
        neededBy: dto.neededBy ? new Date(dto.neededBy) : null,
      }),
    );
  }
  listBulk() {
    return this.bulk.find({
      where: { status: 'open' },
      order: { createdAt: 'DESC' },
    });
  }

  async bulkDetails(requestId: string) {
    const request = await this.bulk.findOneBy({ id: requestId });
    if (!request) throw new NotFoundException('Bulk request not found');
    const offers = await this.bulkOffers.find({
      where: { requestId },
      order: { unitPrice: 'ASC', deliveryDays: 'ASC' },
    });
    return { request, offers };
  }

  async submitBulkOffer(
    sellerId: string,
    requestId: string,
    dto: BulkOfferDto,
  ) {
    const request = await this.bulk.findOneBy({ id: requestId });
    if (!request || request.status !== 'open') {
      throw new BadRequestException('Bulk request is not open');
    }
    if (request.buyerId === sellerId) {
      throw new BadRequestException('Buyer cannot offer on own request');
    }
    const existing = await this.bulkOffers.findOne({
      where: { requestId, sellerId, status: 'submitted' },
    });
    return this.bulkOffers.save(
      this.bulkOffers.create({
        ...(existing ?? {}),
        requestId,
        sellerId,
        ...dto,
        status: 'submitted',
      }),
    );
  }

  async selectBulkOffer(buyerId: string, requestId: string, offerId: string) {
    return this.dataSource.transaction(async (manager) => {
      const request = await manager
        .getRepository(MarketplaceBulkRequest)
        .findOne({
          where: { id: requestId },
          lock: { mode: 'pessimistic_write' },
        });
      if (!request) throw new NotFoundException('Bulk request not found');
      if (request.buyerId !== buyerId) throw new ForbiddenException();
      if (request.status !== 'open') {
        throw new BadRequestException('Bulk request is no longer open');
      }
      const offer = await manager.getRepository(MarketplaceBulkOffer).findOne({
        where: { id: offerId, requestId, status: 'submitted' },
        lock: { mode: 'pessimistic_write' },
      });
      if (!offer) throw new NotFoundException('Bulk offer not found');
      request.status = 'matched';
      request.selectedOfferId = offer.id;
      offer.status = 'selected';
      await manager.save(request);
      await manager.save(offer);
      await manager
        .getRepository(MarketplaceBulkOffer)
        .createQueryBuilder()
        .update(MarketplaceBulkOffer)
        .set({ status: 'rejected' })
        .where('requestId = :requestId', { requestId })
        .andWhere('id <> :offerId', { offerId })
        .andWhere("status = 'submitted'")
        .execute();
      return { request, selectedOffer: offer };
    });
  }

  adminBulkRequests() {
    return this.bulk.find({ order: { createdAt: 'DESC' }, take: 500 });
  }

  async createAuction(sellerId: string, dto: AuctionDto) {
    const product = await this.product(dto.productId);
    if (product.sellerId !== sellerId) throw new ForbiddenException();
    return this.auctions.save(
      this.auctions.create({
        ...dto,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        highestBid: 0,
        status: 'scheduled',
      }),
    );
  }
  async bid(userId: string, auctionId: string, dto: BidDto) {
    return this.dataSource.transaction(async (manager) => {
      const auction = await manager.getRepository(MarketplaceAuction).findOne({
        where: { id: auctionId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!auction) throw new NotFoundException();
      const now = new Date();
      if (
        now < auction.startsAt ||
        now >= auction.endsAt ||
        auction.status === 'cancelled'
      )
        throw new BadRequestException('Auction is not live');
      if (dto.amount <= Math.max(auction.startingPrice, auction.highestBid))
        throw new BadRequestException('Bid must exceed current price');
      auction.highestBid = dto.amount;
      auction.highestBidderId = userId;
      auction.status = 'live';
      await manager.save(auction);
      return manager.save(
        manager.create(MarketplaceBid, {
          auctionId,
          bidderId: userId,
          amount: dto.amount,
        }),
      );
    });
  }

  async sendMessage(senderId: string, dto: MessageDto) {
    const ids = [senderId, dto.receiverId].sort();
    const conversationId = `${ids[0]}:${ids[1]}:${dto.productId ?? 'general'}`;
    return this.messages.save(
      this.messages.create({
        conversationId,
        senderId,
        receiverId: dto.receiverId,
        productId: dto.productId,
        message: dto.message,
      }),
    );
  }
  async conversation(userId: string, otherId: string, productId?: string) {
    const ids = [userId, otherId].sort();
    const conversationId = `${ids[0]}:${ids[1]}:${productId ?? 'general'}`;
    const messages = await this.messages.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
    await this.messages
      .createQueryBuilder()
      .update(MarketplaceMessage)
      .set({ readAt: new Date() })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('receiverId = :userId', { userId })
      .andWhere('readAt IS NULL')
      .execute();
    return messages;
  }

  unreadMessageCount(userId: string) {
    return this.messages.count({
      where: { receiverId: userId, readAt: IsNull() },
    });
  }

  listAuctions() {
    return this.auctions.find({ order: { startsAt: 'ASC' } });
  }

  async listProductReviews(productId: string) {
    const reviews = await this.reviews.find({
      where: { productId, status: 'published' },
      order: { createdAt: 'DESC' },
    });
    const average = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    const distribution = [1, 2, 3, 4, 5].reduce<Record<number, number>>(
      (result, rating) => {
        result[rating] = reviews.filter(
          (review) => review.rating === rating,
        ).length;
        return result;
      },
      {},
    );
    return {
      reviews,
      aggregate: { average, count: reviews.length, distribution },
    };
  }

  adminReviews() {
    return this.reviews.find({ order: { createdAt: 'DESC' }, take: 500 });
  }

  async moderateReview(reviewId: string, status: 'published' | 'hidden') {
    const review = await this.reviews.findOneBy({ id: reviewId });
    if (!review) throw new NotFoundException('Review not found');
    review.status = status;
    return this.reviews.save(review);
  }

  async review(userId: string, dto: ReviewDto) {
    const order = await this.orders.findOneByOrFail({ id: dto.orderId });
    if (
      order.buyerId !== userId ||
      order.status !== 'delivered' ||
      !order.items.some((x) => x.productId === dto.productId)
    )
      throw new ForbiddenException();
    return this.reviews.save(
      this.reviews.create({ reviewerId: userId, ...dto }),
    );
  }
  async moderate(actorId: string, productId: string, dto: ModerateProductDto) {
    const p = await this.product(productId);
    if (
      p.restrictedProduct &&
      p.requiresLicense &&
      !dto.licenseVerified &&
      dto.status === 'published'
    )
      throw new BadRequestException(
        'Restricted product license must be verified',
      );
    p.status = dto.status;
    p.moderationReason = dto.reason;
    p.moderatedBy = actorId;
    p.moderatedAt = new Date();
    p.moderationEvidenceUrls = dto.evidenceUrls ?? [];
    p.moderationAuditNotes = dto.auditNotes ?? null;
    p.moderationHistory = [
      ...(p.moderationHistory ?? []),
      {
        actorId,
        status: dto.status,
        reason: dto.reason,
        auditNotes: dto.auditNotes,
        evidenceUrls: dto.evidenceUrls ?? [],
        createdAt: new Date().toISOString(),
      },
    ];
    if (dto.licenseVerified !== undefined)
      p.licenseVerified = dto.licenseVerified;
    const saved = await this.products.save(p);
    await this.cache.invalidateSearches();
    return saved;
  }
  async appeal(sellerId: string, productId: string, dto: AppealDto) {
    const p = await this.product(productId);
    if (p.sellerId !== sellerId) throw new ForbiddenException();
    p.appealStatus = 'submitted';
    p.appealMessage = dto.message;
    return this.products.save(p);
  }

  async descriptionDraft(productId: string, requestedBy: string) {
    const product = await this.product(productId);
    if (product.sellerId !== requestedBy) throw new ForbiddenException();
    const task = await this.aiTasks.save(
      this.aiTasks.create({
        productId,
        requestedBy,
        type: 'description-generation',
        status: 'queued',
        input: {
          title: product.title,
          categoryCode: product.categoryCode,
          description: product.description,
          useCases: product.useCases,
          symptoms: product.symptoms,
          safetyNotes: product.safetyNotes,
          specifications: product.specifications,
        },
        output: {},
      }),
    );
    const queued = await this.queue.add(
      'ai',
      'marketplace-description-generate',
      { taskId: task.id, productId },
      { jobId: `marketplace-description:${task.id}` },
    );
    if ('queued' in queued && queued.queued === false) {
      task.status = 'failed';
      task.error = queued.reason;
      await this.aiTasks.save(task);
    }
    return task;
  }

  async imageEditRequest(
    productId: string,
    requestedBy: string,
    imageUrl?: string,
  ) {
    const product = await this.product(productId);
    if (product.sellerId !== requestedBy) throw new ForbiddenException();
    const sourceImageUrl = imageUrl || product.imageUrls[0];
    if (!sourceImageUrl)
      throw new BadRequestException('A source product image is required');
    const task = await this.aiTasks.save(
      this.aiTasks.create({
        productId,
        requestedBy,
        type: 'image-background-removal',
        status: 'queued',
        input: { imageUrl: sourceImageUrl },
        output: {},
      }),
    );
    const queued = await this.queue.add(
      'media',
      'marketplace-background-remove',
      { taskId: task.id, productId, imageUrl: sourceImageUrl },
      { jobId: `marketplace-background:${task.id}` },
    );
    if ('queued' in queued && queued.queued === false) {
      task.status = 'failed';
      task.error = queued.reason;
      await this.aiTasks.save(task);
    }
    return task;
  }

  listAiTasks(sellerId: string, productId?: string) {
    return this.aiTasks.find({
      where: productId
        ? { requestedBy: sellerId, productId }
        : { requestedBy: sellerId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async reviewAiTask(
    sellerId: string,
    taskId: string,
    decision: 'apply' | 'reject',
  ) {
    const task = await this.aiTasks.findOneBy({ id: taskId });
    if (!task || task.requestedBy !== sellerId)
      throw new NotFoundException('Task not found');
    if (task.status !== 'completed')
      throw new BadRequestException('Task is not ready for review');
    const product = await this.product(task.productId);
    if (decision === 'reject') {
      task.status = 'rejected';
      task.reviewedAt = new Date();
      return this.aiTasks.save(task);
    }
    if (task.type === 'description-generation') {
      const description =
        typeof task.output.description === 'string'
          ? task.output.description.trim()
          : '';
      if (!description)
        throw new BadRequestException('Generated description is empty');
      product.description = description;
    } else {
      const outputUrl =
        typeof task.output.outputUrl === 'string'
          ? task.output.outputUrl.trim()
          : '';
      if (!outputUrl)
        throw new BadRequestException('Edited image output is missing');
      product.imageUrls = [
        outputUrl,
        ...product.imageUrls.filter((url) => url !== outputUrl),
      ];
    }
    await this.products.save(product);
    await this.cache.invalidateSearches();
    task.status = 'applied';
    task.reviewedAt = new Date();
    return this.aiTasks.save(task);
  }

  async priceGuidance(productId: string) {
    const product = await this.product(productId);
    const peers = await this.products.find({
      where: { categoryCode: product.categoryCode, status: 'published' },
      take: 200,
    });
    const values = peers.map((peer) => peer.price).sort((a, b) => a - b);
    const median = values.length
      ? values[Math.floor(values.length / 2)]
      : product.price;
    const orders = await this.orders.find({
      where: { status: 'delivered' },
      order: { createdAt: 'DESC' },
      take: 2000,
    });
    const monthlyDemand = Array.from({ length: 12 }, () => 0);
    const monthlyRevenue = Array.from({ length: 12 }, () => 0);
    for (const order of orders) {
      const month = order.createdAt.getMonth();
      for (const item of order.items) {
        const peer = peers.find((candidate) => candidate.id === item.productId);
        if (!peer && item.productId !== product.id) continue;
        monthlyDemand[month] += item.quantity;
        monthlyRevenue[month] += item.subtotal;
      }
    }
    const rankedMonths = monthlyDemand
      .map((demand, month) => ({
        month: month + 1,
        demand,
        revenue: monthlyRevenue[month],
      }))
      .sort((a, b) => b.demand - a.demand || b.revenue - a.revenue);
    const bestMonths = rankedMonths
      .filter((item) => item.demand > 0)
      .slice(0, 3);
    const nowMonth = new Date().getMonth() + 1;
    const currentDemand =
      rankedMonths.find((item) => item.month === nowMonth)?.demand ?? 0;
    const maximumDemand = rankedMonths[0]?.demand ?? 0;
    return {
      suggestedPrice: Number(median.toFixed(2)),
      currentPrice: product.price,
      peerCount: peers.length,
      priceRange: values.length
        ? { minimum: values[0], maximum: values[values.length - 1] }
        : { minimum: product.price, maximum: product.price },
      bestMonths,
      currentMonthDemand: currentDemand,
      demandBand:
        maximumDemand === 0
          ? 'insufficient-data'
          : currentDemand >= maximumDemand * 0.75
            ? 'high'
            : currentDemand >= maximumDemand * 0.4
              ? 'medium'
              : 'low',
      guidanceSource: 'delivered-order-history-and-active-peer-prices',
      generatedAt: new Date().toISOString(),
    };
  }

  private product(id: string) {
    return this.products.findOneBy({ id }).then((p) => {
      if (!p) throw new NotFoundException('Product not found');
      return p;
    });
  }
  private tokenize(value: string) {
    return Array.from(
      new Set(
        value
          .toLocaleLowerCase('en')
          .normalize('NFKC')
          .replace(/[^\p{L}\p{N}]+/gu, ' ')
          .split(/\s+/)
          .map((token) => token.trim())
          .filter((token) => token.length >= 2),
      ),
    );
  }

  private normalizeVoice(value: string) {
    return value
      .toLowerCase()
      .replace(/[.,!?]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
