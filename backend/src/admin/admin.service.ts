import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Deal, Offer } from '../deals/entities/deal.entity';
import { CreateGoodDto } from '../goods/dto/good.dto';
import { Good, GoodsCategory } from '../goods/entities/good.entity';
import { toApiEntity } from '../lib/database/base.entity';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { CreateMarketPriceDto } from '../market-price/dto/market-price.dto';
import { MarketPrice } from '../market-price/entities/market-price.entity';
import { SellerInventory } from '../medicine-sellers/entities/medicine.entity';
import { User } from '../user/entities/user.entity';
import { Guidance, GuidanceTargetRole } from './entities/admin-content.entity';
import {
  AdminSearchDto,
  AdminUpdateDealDto,
  AdminUpdateInventoryDto,
  AdminUpdateListingDto,
  AdminUpdateUserDto,
  AdminUserSearchDto,
  CreateGuidanceDto,
  UpdateVerificationDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Guidance)
    private readonly guidanceRepository: Repository<Guidance>,
    @InjectRepository(Good)
    private readonly goodRepository: Repository<Good>,
    @InjectRepository(GoodsCategory)
    private readonly categoryRepository: Repository<GoodsCategory>,
    @InjectRepository(MarketPrice)
    private readonly priceRepository: Repository<MarketPrice>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    @InjectRepository(SellerInventory)
    private readonly inventoryRepository: Repository<SellerInventory>,
  ) {}

  async dashboard() {
    const [
      totalUsers,
      pendingUsers,
      totalListings,
      activeListings,
      totalDeals,
      inventoryItems,
      volumeRow,
      usersByRole,
      dealTrend,
      listingTrend,
      recentDeals,
      recentListings,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { verificationStatus: 'pending' } }),
      this.listingRepository.count(),
      this.listingRepository
        .createQueryBuilder('listing')
        .where('listing.status IN (:...statuses)', {
          statuses: [ListingStatus.PUBLISHED, ListingStatus.RESERVED],
        })
        .getCount(),
      this.dealRepository.count(),
      this.inventoryRepository
        .createQueryBuilder('inventory')
        .where('inventory.active = true')
        .andWhere('inventory.stockQuantity > 0')
        .getCount(),
      this.dealRepository
        .createQueryBuilder('deal')
        .select('COALESCE(SUM(deal.totalPrice), 0)', 'total')
        .where('deal.status != :status', { status: 'cancelled' })
        .getRawOne<{ total: string }>(),
      this.userRepository
        .createQueryBuilder('user')
        .select('user.role', 'role')
        .addSelect('COUNT(*)::int', 'value')
        .groupBy('user.role')
        .orderBy('value', 'DESC')
        .getRawMany<{ role: string; value: number }>(),
      this.dealRepository
        .createQueryBuilder('deal')
        .select("TO_CHAR(deal.confirmedAt, 'YYYY-MM')", 'month')
        .addSelect('COUNT(*)::int', 'deals')
        .addSelect('COALESCE(SUM(deal.totalPrice), 0)', 'volume')
        .groupBy("TO_CHAR(deal.confirmedAt, 'YYYY-MM')")
        .orderBy('month', 'ASC')
        .limit(12)
        .getRawMany<{ month: string; deals: number; volume: string }>(),
      this.listingRepository
        .createQueryBuilder('listing')
        .select("TO_CHAR(listing.createdAt, 'YYYY-MM')", 'month')
        .addSelect('COUNT(*)::int', 'listings')
        .groupBy("TO_CHAR(listing.createdAt, 'YYYY-MM')")
        .orderBy('month', 'ASC')
        .limit(12)
        .getRawMany<{ month: string; listings: number }>(),
      this.dealRepository.find({ order: { confirmedAt: 'DESC' }, take: 6 }),
      this.listingRepository.find({ order: { createdAt: 'DESC' }, take: 6 }),
    ]);

    const trendMap = new Map<
      string,
      { month: string; deals: number; listings: number; volume: number }
    >();
    for (const item of dealTrend) {
      trendMap.set(item.month, {
        month: item.month,
        deals: Number(item.deals),
        listings: 0,
        volume: Number(item.volume),
      });
    }
    for (const item of listingTrend) {
      const current = trendMap.get(item.month) ?? {
        month: item.month,
        deals: 0,
        listings: 0,
        volume: 0,
      };
      current.listings = Number(item.listings);
      trendMap.set(item.month, current);
    }

    return {
      data: {
        metrics: {
          totalUsers,
          pendingUsers,
          totalListings,
          activeListings,
          totalDeals,
          dealVolume: Number(volumeRow?.total ?? 0),
          inventoryItems,
        },
        usersByRole,
        activityTrend: [...trendMap.values()].sort((a, b) =>
          a.month.localeCompare(b.month),
        ),
        recentDeals: recentDeals.map(toApiEntity),
        recentListings: recentListings.map(toApiEntity),
      },
    };
  }

  async pendingUsers() {
    const data = await this.userRepository.find({
      where: { verificationStatus: 'pending' },
      order: { createdAt: 'ASC' },
    });
    return { data: data.map(toApiEntity) };
  }

  async users(query: AdminUserSearchDto) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC')
      .take(query.limit ?? 250);
    if (query.role) qb.andWhere('user.role = :role', { role: query.role });
    if (query.verificationStatus) {
      qb.andWhere('user.verificationStatus = :status', {
        status: query.verificationStatus,
      });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        new Brackets((inner) => {
          inner
            .where('user.name ILIKE :search', {
              search: `%${query.search!.trim()}%`,
            })
            .orWhere('user.phoneNumber ILIKE :search')
            .orWhere('user.email ILIKE :search')
            .orWhere('user.businessName ILIKE :search')
            .orWhere('user.shopName ILIKE :search');
        }),
      );
    }
    return { data: (await qb.getMany()).map(toApiEntity) };
  }

  async updateVerification(userId: string, dto: UpdateVerificationDto) {
    return this.updateUser(userId, { verificationStatus: dto.status });
  }

  async updateUser(userId: string, dto: AdminUpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const phoneNumber = dto.phoneNumber?.trim();
    const email = dto.email?.trim().toLowerCase();
    if (phoneNumber || email) {
      const qb = this.userRepository
        .createQueryBuilder('user')
        .where('user.id != :userId', { userId })
        .andWhere(
          new Brackets((inner) => {
            if (phoneNumber)
              inner.where('user.phoneNumber = :phoneNumber', { phoneNumber });
            if (email && phoneNumber) {
              inner.orWhere('LOWER(user.email) = :email', { email });
            } else if (email) {
              inner.where('LOWER(user.email) = :email', { email });
            }
          }),
        );
      if (await qb.getExists()) {
        throw new ConflictException('Phone number or email is already in use');
      }
    }

    Object.assign(user, {
      ...(dto.name != null ? { name: dto.name.trim() } : {}),
      ...(phoneNumber != null ? { phoneNumber } : {}),
      ...(email != null ? { email } : {}),
      ...(dto.role != null ? { role: dto.role } : {}),
      ...(dto.verificationStatus != null
        ? { verificationStatus: dto.verificationStatus }
        : {}),
      ...(dto.landAmount != null ? { landAmount: dto.landAmount } : {}),
      ...(dto.address != null ? { address: dto.address.trim() } : {}),
      ...(dto.businessName != null
        ? { businessName: dto.businessName.trim() }
        : {}),
      ...(dto.shopName != null ? { shopName: dto.shopName.trim() } : {}),
    });
    return { data: toApiEntity(await this.userRepository.save(user)) };
  }

  async createGuidance(dto: CreateGuidanceDto) {
    const data = await this.guidanceRepository.save(
      this.guidanceRepository.create({
        ...dto,
        title: dto.title.trim(),
        message: dto.message.trim(),
        active: dto.active ?? true,
        publishedAt: new Date(),
      }),
    );
    return { data: toApiEntity(data) };
  }

  async guidance(role: string) {
    const allowedRoles: GuidanceTargetRole[] = [
      'farmer',
      'buyer',
      'agent',
      'medicineSeller',
      'all',
    ];
    const normalizedRole: GuidanceTargetRole = allowedRoles.includes(
      role as GuidanceTargetRole,
    )
      ? (role as GuidanceTargetRole)
      : 'farmer';
    const data = await this.guidanceRepository
      .createQueryBuilder('guidance')
      .where('guidance.active = true')
      .andWhere('guidance.targetRole IN (:...roles)', {
        roles: ['all', normalizedRole],
      })
      .orderBy('guidance.publishedAt', 'DESC')
      .take(50)
      .getMany();
    return { data: data.map(toApiEntity) };
  }

  async listings(query: AdminSearchDto) {
    const qb = this.listingRepository
      .createQueryBuilder('listing')
      .orderBy('listing.createdAt', 'DESC')
      .take(query.limit ?? 250);
    if (query.search?.trim()) {
      qb.where(
        '(listing.goodName ILIKE :search OR listing.goodCode ILIKE :search OR listing.address ILIKE :search OR CAST(listing.ownerId AS text) ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }
    return { data: (await qb.getMany()).map(toApiEntity) };
  }

  async updateListing(id: string, dto: AdminUpdateListingDto) {
    const data = await this.listingRepository.findOne({ where: { id } });
    if (!data) throw new NotFoundException('Listing not found');
    data.status = dto.status as ListingStatus;
    return { data: toApiEntity(await this.listingRepository.save(data)) };
  }

  async deals(query: AdminSearchDto) {
    const qb = this.dealRepository
      .createQueryBuilder('deal')
      .orderBy('deal.confirmedAt', 'DESC')
      .take(query.limit ?? 250);
    if (query.search?.trim()) {
      qb.where(
        '(CAST(deal.buyerId AS text) ILIKE :search OR CAST(deal.farmerId AS text) ILIKE :search OR CAST(deal.listingId AS text) ILIKE :search OR deal.status ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }
    return { data: (await qb.getMany()).map(toApiEntity) };
  }

  async updateDeal(id: string, dto: AdminUpdateDealDto) {
    const data = await this.dealRepository.findOne({ where: { id } });
    if (!data) throw new NotFoundException('Deal not found');
    data.status = dto.status;
    return { data: toApiEntity(await this.dealRepository.save(data)) };
  }

  async offers(query: AdminSearchDto) {
    const qb = this.offerRepository
      .createQueryBuilder('offer')
      .orderBy('offer.createdAt', 'DESC')
      .take(query.limit ?? 250);
    if (query.search?.trim()) {
      qb.where(
        '(CAST(offer.buyerId AS text) ILIKE :search OR CAST(offer.farmerId AS text) ILIKE :search OR CAST(offer.listingId AS text) ILIKE :search OR CAST(offer.status AS text) ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }
    return { data: (await qb.getMany()).map(toApiEntity) };
  }

  async prices() {
    const data = await this.priceRepository.find({
      order: { priceDate: 'DESC', goodName: 'ASC' },
      take: 500,
    });
    return { data: data.map(toApiEntity) };
  }

  async upsertPrice(dto: CreateMarketPriceDto) {
    const goodCode = dto.goodCode.trim().toLowerCase();
    const region = dto.region.trim();
    const rawDate = dto.priceDate ? new Date(dto.priceDate) : new Date();
    const priceDate = rawDate.toISOString().slice(0, 10);
    await this.priceRepository.upsert({ ...dto, goodCode, region, priceDate }, [
      'goodCode',
      'region',
      'priceDate',
    ]);
    const data = await this.priceRepository.findOneByOrFail({
      goodCode,
      region,
      priceDate,
    });
    return { data: toApiEntity(data) };
  }

  async goods() {
    const [goods, categories] = await Promise.all([
      this.goodRepository.find({ order: { name: 'ASC' } }),
      this.categoryRepository.find({ order: { name: 'ASC' } }),
    ]);
    return {
      data: {
        goods: goods.map(toApiEntity),
        categories: categories.map(toApiEntity),
      },
    };
  }

  async upsertGood(dto: CreateGoodDto) {
    const code = dto.code.trim().toLowerCase();
    await this.goodRepository.upsert(
      {
        ...dto,
        code,
        categoryCode: dto.categoryCode.trim().toLowerCase(),
        active: dto.active ?? true,
      },
      ['code'],
    );
    const data = await this.goodRepository.findOneByOrFail({ code });
    return { data: toApiEntity(data) };
  }

  async inventory(query: AdminSearchDto) {
    const qb = this.inventoryRepository
      .createQueryBuilder('inventory')
      .orderBy('inventory.shopName', 'ASC')
      .addOrderBy('inventory.medicineName', 'ASC')
      .take(query.limit ?? 500);
    if (query.search?.trim()) {
      qb.where(
        '(inventory.medicineName ILIKE :search OR inventory.medicineCode ILIKE :search OR inventory.shopName ILIKE :search OR inventory.address ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }
    return { data: (await qb.getMany()).map(toApiEntity) };
  }

  async updateInventory(id: string, dto: AdminUpdateInventoryDto) {
    const data = await this.inventoryRepository.findOne({ where: { id } });
    if (!data) throw new NotFoundException('Inventory item not found');
    Object.assign(data, {
      ...(dto.stockQuantity != null
        ? { stockQuantity: dto.stockQuantity }
        : {}),
      ...(dto.price != null ? { price: dto.price } : {}),
      ...(dto.active != null ? { active: dto.active } : {}),
    });
    return { data: toApiEntity(await this.inventoryRepository.save(data)) };
  }
}
