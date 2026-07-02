import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { DEAL_MODEL, Deal } from '../deals/deal.entity';
import {
  LISTING_MODEL,
  Listing,
  ListingStatus,
} from '../listings/listing.entity';
import {
  REPORT_MODEL,
  Report,
  ReportStatus,
} from '../reports/report.entity';
import { USER_MODEL, User, UserType } from '../user/user.entity';
import { GUIDANCE_MODEL, Guidance } from './admin-content.entity';
import {
  AdminDealQueryDto,
  AdminListingQueryDto,
  AdminUserQueryDto,
  CreateGuidanceDto,
  UpdateAdminUserDto,
  UpdateDealStatusDto,
  UpdateListingStatusDto,
  UpdateVerificationDto,
} from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(USER_MODEL)
    private readonly userModel: Model<User>,
    @InjectModel(GUIDANCE_MODEL)
    private readonly guidanceModel: Model<Guidance>,
    @InjectModel(LISTING_MODEL)
    private readonly listingModel: Model<Listing>,
    @InjectModel(DEAL_MODEL)
    private readonly dealModel: Model<Deal>,
    @InjectModel(REPORT_MODEL)
    private readonly reportModel: Model<Report>,
  ) {}

  async dashboard() {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      totalListings,
      publishedListings,
      totalDeals,
      openReports,
      roleBreakdown,
      verificationBreakdown,
      listingBreakdown,
      dealBreakdown,
      gmvResult,
      recentUsers,
      recentListings,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ isActive: { $ne: false } }),
      this.userModel.countDocuments({ verificationStatus: 'pending' }),
      this.listingModel.countDocuments(),
      this.listingModel.countDocuments({ status: ListingStatus.PUBLISHED }),
      this.dealModel.countDocuments(),
      this.reportModel.countDocuments({
        status: { $in: [ReportStatus.OPEN, ReportStatus.REVIEWING] },
      }),
      this.userModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.userModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
      ]),
      this.listingModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.dealModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.dealModel.aggregate<{ total: number }>([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      this.userModel
        .find()
        .select('-credentialHash -otpNumber')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      this.listingModel.find().sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    return {
      data: {
        metrics: {
          totalUsers,
          activeUsers,
          pendingUsers,
          totalListings,
          publishedListings,
          totalDeals,
          openReports,
          grossMarketValue: gmvResult[0]?.total ?? 0,
        },
        roleBreakdown: this.toCountMap(roleBreakdown),
        verificationBreakdown: this.toCountMap(verificationBreakdown),
        listingBreakdown: this.toCountMap(listingBreakdown),
        dealBreakdown: this.toCountMap(dealBreakdown),
        recentUsers,
        recentListings,
      },
    };
  }

  async listUsers(query: AdminUserQueryDto) {
    const filter: FilterQuery<User> = {};
    if (query.role) filter.role = query.role;
    if (query.verificationStatus) {
      filter.verificationStatus = query.verificationStatus;
    }
    if (query.isActive) filter.isActive = query.isActive === 'true';
    if (query.search?.trim()) {
      const search = new RegExp(this.escapeRegex(query.search.trim()), 'i');
      filter.$or = [
        { name: search },
        { email: search },
        { phoneNumber: search },
        { businessName: search },
        { shopName: search },
        { address: search },
      ];
    }

    const { page, limit } = this.pagination(query.page, query.limit);
    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-credentialHash -otpNumber')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);
    return { data, meta: this.meta(page, limit, total) };
  }

  async updateUser(
    userId: string,
    actingAdminId: string,
    dto: UpdateAdminUserDto,
  ) {
    if (
      userId === actingAdminId &&
      (dto.isActive === false || (dto.role && dto.role !== UserType.ADMIN))
    ) {
      throw new BadRequestException(
        'You cannot suspend or remove your own administrator role',
      );
    }

    const update: Record<string, unknown> = {};
    if (dto.role !== undefined) update.role = dto.role;
    if (dto.verificationStatus !== undefined) {
      update.verificationStatus = dto.verificationStatus;
    }
    if (dto.isActive !== undefined) update.isActive = dto.isActive;

    const data = await this.userModel
      .findByIdAndUpdate(userId, update, { returnDocument: 'after' })
      .select('-credentialHash -otpNumber')
      .lean();
    if (!data) throw new NotFoundException('User not found');
    return { data };
  }

  async pendingUsers() {
    const data = await this.userModel
      .find({ verificationStatus: 'pending' })
      .select('-credentialHash -otpNumber')
      .sort({ createdAt: 1 })
      .lean();
    return { data };
  }

  async updateVerification(userId: string, dto: UpdateVerificationDto) {
    const data = await this.userModel
      .findOneAndUpdate(
        { _id: userId, role: { $ne: UserType.ADMIN } },
        { verificationStatus: dto.status },
        { returnDocument: 'after' },
      )
      .select('-credentialHash -otpNumber')
      .lean();
    if (!data) throw new NotFoundException('User not found');
    return { data };
  }

  async listListings(query: AdminListingQueryDto) {
    const filter: FilterQuery<Listing> = {};
    if (query.status) filter.status = query.status;
    if (query.search?.trim()) {
      const search = new RegExp(this.escapeRegex(query.search.trim()), 'i');
      filter.$or = [
        { goodName: search },
        { goodCode: search },
        { address: search },
        { ownerId: search },
      ];
    }
    const { page, limit } = this.pagination(query.page, query.limit);
    const [data, total] = await Promise.all([
      this.listingModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.listingModel.countDocuments(filter),
    ]);
    return { data, meta: this.meta(page, limit, total) };
  }

  async updateListingStatus(id: string, dto: UpdateListingStatusDto) {
    const data = await this.listingModel
      .findByIdAndUpdate(id, { status: dto.status }, { returnDocument: 'after' })
      .lean();
    if (!data) throw new NotFoundException('Listing not found');
    return { data };
  }

  async listDeals(query: AdminDealQueryDto) {
    const filter: FilterQuery<Deal> = {};
    if (query.status) filter.status = query.status;
    if (query.search?.trim()) {
      const search = new RegExp(this.escapeRegex(query.search.trim()), 'i');
      filter.$or = [
        { offerId: search },
        { listingId: search },
        { buyerId: search },
        { farmerId: search },
      ];
    }
    const { page, limit } = this.pagination(query.page, query.limit);
    const [data, total] = await Promise.all([
      this.dealModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.dealModel.countDocuments(filter),
    ]);
    return { data, meta: this.meta(page, limit, total) };
  }

  async updateDealStatus(id: string, dto: UpdateDealStatusDto) {
    const data = await this.dealModel
      .findByIdAndUpdate(id, { status: dto.status }, { returnDocument: 'after' })
      .lean();
    if (!data) throw new NotFoundException('Deal not found');
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
    const data = await this.guidanceModel
      .find({
        active: true,
        targetRole: { $in: ['all', role] },
      })
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean();
    return { data };
  }

  private pagination(pageValue?: number, limitValue?: number) {
    return {
      page: Math.max(1, pageValue || 1),
      limit: Math.min(100, Math.max(1, limitValue || 20)),
    };
  }

  private meta(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  private toCountMap(rows: Array<{ _id: string; count: number }>) {
    return Object.fromEntries(rows.map((row) => [row._id ?? 'unknown', row.count]));
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}