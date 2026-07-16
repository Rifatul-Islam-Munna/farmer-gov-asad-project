import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DEAL_MODEL, Deal, OFFER_MODEL, Offer } from '../deals/deal.entity';
import { CreateGoodDto } from '../goods/good.dto';
import {
  GOOD_MODEL,
  Good,
  GOODS_CATEGORY_MODEL,
  GoodsCategory,
} from '../goods/good.entity';
import {
  LISTING_MODEL,
  Listing,
  ListingStatus,
} from '../listings/listing.entity';
import { CreateMarketPriceDto } from '../market-price/market-price.dto';
import {
  MARKET_PRICE_MODEL,
  MarketPrice,
} from '../market-price/market-price.entity';
import {
  SELLER_INVENTORY_MODEL,
  SellerInventory,
} from '../medicine-sellers/medicine.entity';
import { USER_MODEL, User } from '../user/user.entity';
import { GUIDANCE_MODEL, Guidance } from './admin-content.entity';
import {
  AdminSearchDto,
  AdminUpdateDealDto,
  AdminUpdateInventoryDto,
  AdminUpdateListingDto,
  AdminUpdateUserDto,
  AdminUserSearchDto,
  CreateGuidanceDto,
  UpdateVerificationDto,
} from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(USER_MODEL)
    private readonly userModel: Model<User>,
    @InjectModel(GUIDANCE_MODEL)
    private readonly guidanceModel: Model<Guidance>,
    @InjectModel(GOOD_MODEL)
    private readonly goodModel: Model<Good>,
    @InjectModel(GOODS_CATEGORY_MODEL)
    private readonly categoryModel: Model<GoodsCategory>,
    @InjectModel(MARKET_PRICE_MODEL)
    private readonly priceModel: Model<MarketPrice>,
    @InjectModel(LISTING_MODEL)
    private readonly listingModel: Model<Listing>,
    @InjectModel(OFFER_MODEL)
    private readonly offerModel: Model<Offer>,
    @InjectModel(DEAL_MODEL)
    private readonly dealModel: Model<Deal>,
    @InjectModel(SELLER_INVENTORY_MODEL)
    private readonly inventoryModel: Model<SellerInventory>,
  ) {}

  async dashboard() {
    const [
      totalUsers,
      pendingUsers,
      totalListings,
      activeListings,
      totalDeals,
      inventoryItems,
      volumeRows,
      usersByRole,
      dealTrend,
      listingTrend,
      recentDeals,
      recentListings,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ verificationStatus: 'pending' }),
      this.listingModel.countDocuments(),
      this.listingModel.countDocuments({
        status: { $in: [ListingStatus.PUBLISHED, ListingStatus.RESERVED] },
      }),
      this.dealModel.countDocuments(),
      this.inventoryModel.countDocuments({
        active: true,
        stockQuantity: { $gt: 0 },
      }),
      this.dealModel.aggregate<{ total: number }>([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      this.userModel.aggregate<{ _id: string; value: number }>([
        { $group: { _id: '$role', value: { $sum: 1 } } },
        { $sort: { value: -1 } },
      ]),
      this.dealModel.aggregate<{
        _id: string;
        deals: number;
        volume: number;
      }>([
        { $match: { confirmedAt: { $exists: true } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$confirmedAt' } },
            deals: { $sum: 1 },
            volume: { $sum: '$totalPrice' },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
      this.listingModel.aggregate<{ _id: string; listings: number }>([
        { $match: { createdAt: { $exists: true } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            listings: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
      this.dealModel.find().sort({ confirmedAt: -1 }).limit(6).lean(),
      this.listingModel.find().sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    const trendMap = new Map<
      string,
      { month: string; deals: number; listings: number; volume: number }
    >();
    for (const item of dealTrend) {
      trendMap.set(item._id, {
        month: item._id,
        deals: item.deals,
        listings: 0,
        volume: item.volume,
      });
    }
    for (const item of listingTrend) {
      const current = trendMap.get(item._id) ?? {
        month: item._id,
        deals: 0,
        listings: 0,
        volume: 0,
      };
      current.listings = item.listings;
      trendMap.set(item._id, current);
    }

    return {
      data: {
        metrics: {
          totalUsers,
          pendingUsers,
          totalListings,
          activeListings,
          totalDeals,
          dealVolume: Number(volumeRows[0]?.total ?? 0),
          inventoryItems,
        },
        usersByRole: usersByRole.map((item) => ({
          role: item._id,
          value: item.value,
        })),
        activityTrend: [...trendMap.values()].sort((a, b) =>
          a.month.localeCompare(b.month),
        ),
        recentDeals,
        recentListings,
      },
    };
  }

  async pendingUsers() {
    const data = await this.userModel
      .find({ verificationStatus: 'pending' })
      .select('-credentialHash -otpNumber')
      .sort({ createdAt: 1 })
      .lean();
    return { data };
  }

  async users(query: AdminUserSearchDto) {
    const filter: Record<string, any> = {};
    if (query.role) filter.role = query.role;
    if (query.verificationStatus) {
      filter.verificationStatus = query.verificationStatus;
    }
    if (query.search?.trim()) {
      const pattern = new RegExp(this.escape(query.search.trim()), 'i');
      filter.$or = [
        { name: pattern },
        { phoneNumber: pattern },
        { email: pattern },
        { businessName: pattern },
        { shopName: pattern },
      ];
    }
    const data = await this.userModel
      .find(filter)
      .select('-credentialHash -otpNumber')
      .sort({ createdAt: -1 })
      .limit(query.limit ?? 250)
      .lean();
    return { data };
  }

  async updateVerification(userId: string, dto: UpdateVerificationDto) {
    return this.updateUser(userId, { verificationStatus: dto.status });
  }

  async updateUser(userId: string, dto: AdminUpdateUserDto) {
    const phoneNumber = dto.phoneNumber?.trim();
    const email = dto.email?.trim().toLowerCase();
    const duplicateFilters: Record<string, string>[] = [];
    if (phoneNumber) duplicateFilters.push({ phoneNumber });
    if (email) duplicateFilters.push({ email });
    if (duplicateFilters.length) {
      const duplicate = await this.userModel
        .findOne({ _id: { $ne: userId }, $or: duplicateFilters })
        .lean();
      if (duplicate) {
        throw new ConflictException('Phone number or email is already in use');
      }
    }

    const set: Record<string, unknown> = {};
    if (dto.name != null) set.name = dto.name.trim();
    if (phoneNumber != null) set.phoneNumber = phoneNumber;
    if (email != null) set.email = email;
    if (dto.role != null) set.role = dto.role;
    if (dto.verificationStatus != null) {
      set.verificationStatus = dto.verificationStatus;
    }
    if (dto.landAmount != null) set.landAmount = dto.landAmount;
    if (dto.address != null) set.address = dto.address.trim();
    if (dto.businessName != null) set.businessName = dto.businessName.trim();
    if (dto.shopName != null) set.shopName = dto.shopName.trim();

    const data = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: set },
        { returnDocument: 'after', runValidators: true },
      )
      .select('-credentialHash -otpNumber')
      .lean();
    if (!data) throw new NotFoundException('User not found');
    return { data };
  }

  async createGuidance(dto: CreateGuidanceDto) {
    const data = await this.guidanceModel.create({
      ...dto,
      title: dto.title.trim(),
      message: dto.message.trim(),
      active: dto.active ?? true,
      publishedAt: new Date(),
    });
    return { data: data.toObject() };
  }

  async guidance(role: string) {
    const allowedRoles: Guidance['targetRole'][] = [
      'farmer',
      'buyer',
      'agent',
      'medicineSeller',
      'all',
    ];
    const normalizedRole: Guidance['targetRole'] = allowedRoles.includes(
      role as Guidance['targetRole'],
    )
      ? (role as Guidance['targetRole'])
      : 'farmer';
    const targetRoles: Guidance['targetRole'][] = ['all', normalizedRole];

    const data = await this.guidanceModel
      .find({ active: true, targetRole: { $in: targetRoles } })
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean();
    return { data };
  }

  async listings(query: AdminSearchDto) {
    const filter: Record<string, any> = {};
    if (query.search?.trim()) {
      const pattern = new RegExp(this.escape(query.search.trim()), 'i');
      filter.$or = [
        { goodName: pattern },
        { goodCode: pattern },
        { address: pattern },
        { ownerId: pattern },
      ];
    }
    const data = await this.listingModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(query.limit ?? 250)
      .lean();
    return { data };
  }

  async updateListing(id: string, dto: AdminUpdateListingDto) {
    const data = await this.listingModel
      .findByIdAndUpdate(
        id,
        { status: dto.status },
        { returnDocument: 'after', runValidators: true },
      )
      .lean();
    if (!data) throw new NotFoundException('Listing not found');
    return { data };
  }

  async deals(query: AdminSearchDto) {
    const filter: Record<string, any> = {};
    if (query.search?.trim()) {
      const pattern = new RegExp(this.escape(query.search.trim()), 'i');
      filter.$or = [
        { buyerId: pattern },
        { farmerId: pattern },
        { listingId: pattern },
        { status: pattern },
      ];
    }
    const data = await this.dealModel
      .find(filter)
      .sort({ confirmedAt: -1 })
      .limit(query.limit ?? 250)
      .lean();
    return { data };
  }

  async updateDeal(id: string, dto: AdminUpdateDealDto) {
    const data = await this.dealModel
      .findByIdAndUpdate(
        id,
        { status: dto.status },
        { returnDocument: 'after', runValidators: true },
      )
      .lean();
    if (!data) throw new NotFoundException('Deal not found');
    return { data };
  }

  async offers(query: AdminSearchDto) {
    const filter: Record<string, any> = {};
    if (query.search?.trim()) {
      const pattern = new RegExp(this.escape(query.search.trim()), 'i');
      filter.$or = [
        { buyerId: pattern },
        { farmerId: pattern },
        { listingId: pattern },
        { status: pattern },
      ];
    }
    const data = await this.offerModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(query.limit ?? 250)
      .lean();
    return { data };
  }

  async prices() {
    const data = await this.priceModel
      .find()
      .sort({ priceDate: -1, goodName: 1 })
      .limit(500)
      .lean();
    return { data };
  }

  async upsertPrice(dto: CreateMarketPriceDto) {
    const goodCode = dto.goodCode.trim().toLowerCase();
    const region = dto.region.trim();
    const rawDate = dto.priceDate ? new Date(dto.priceDate) : new Date();
    const priceDate = new Date(
      Date.UTC(
        rawDate.getUTCFullYear(),
        rawDate.getUTCMonth(),
        rawDate.getUTCDate(),
      ),
    );
    const data = await this.priceModel
      .findOneAndUpdate(
        { goodCode, region, priceDate },
        { ...dto, goodCode, region, priceDate },
        { upsert: true, returnDocument: 'after', runValidators: true },
      )
      .lean();
    return { data };
  }

  async goods() {
    const [goods, categories] = await Promise.all([
      this.goodModel.find().sort({ name: 1 }).lean(),
      this.categoryModel.find().sort({ name: 1 }).lean(),
    ]);
    return { data: { goods, categories } };
  }

  async upsertGood(dto: CreateGoodDto) {
    const code = dto.code.trim().toLowerCase();
    const data = await this.goodModel
      .findOneAndUpdate(
        { code },
        {
          ...dto,
          code,
          categoryCode: dto.categoryCode.trim().toLowerCase(),
          active: dto.active ?? true,
        },
        { upsert: true, returnDocument: 'after', runValidators: true },
      )
      .lean();
    return { data };
  }

  async inventory(query: AdminSearchDto) {
    const filter: Record<string, any> = {};
    if (query.search?.trim()) {
      const pattern = new RegExp(this.escape(query.search.trim()), 'i');
      filter.$or = [
        { medicineName: pattern },
        { medicineCode: pattern },
        { shopName: pattern },
        { address: pattern },
      ];
    }
    const data = await this.inventoryModel
      .find(filter)
      .sort({ shopName: 1, medicineName: 1 })
      .limit(query.limit ?? 500)
      .lean();
    return { data };
  }

  async updateInventory(id: string, dto: AdminUpdateInventoryDto) {
    const set: Record<string, unknown> = {};
    if (dto.stockQuantity != null) set.stockQuantity = dto.stockQuantity;
    if (dto.price != null) set.price = dto.price;
    if (dto.active != null) set.active = dto.active;
    const data = await this.inventoryModel
      .findByIdAndUpdate(
        id,
        { $set: set },
        { returnDocument: 'after', runValidators: true },
      )
      .lean();
    if (!data) throw new NotFoundException('Inventory item not found');
    return { data };
  }

  private escape(value: string) {
    const special = new Set([
      '.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\',
    ]);
    return [...value]
      .map((character) =>
        special.has(character) ? `\\${character}` : character,
      )
      .join('');
  }
}
