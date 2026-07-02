import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { UserType } from '../user/user.entity';
import { CreateListingDto, SearchListingsDto } from './listing.dto';
import { LISTING_MODEL, Listing, ListingStatus } from './listing.entity';

@Injectable()
export class ListingService {
  constructor(
    @InjectModel(LISTING_MODEL)
    private readonly listingModel: Model<Listing>,
  ) {}

  async createForOwner(
    ownerId: string,
    dto: CreateListingDto,
    assistingAgentId?: string,
  ) {
    if (dto.minimumPrice > dto.marketPrice * 2) {
      throw new BadRequestException('Minimum price is unusually high');
    }

    const status = dto.status ?? ListingStatus.PUBLISHED;
    const data = await this.listingModel.create({
      ownerId,
      assistingAgentId,
      goodCode: dto.goodCode.trim().toLowerCase(),
      goodName: dto.goodName.trim(),
      imageUrls: dto.imageUrls ?? [],
      quantity: dto.quantity,
      reservedQuantity: 0,
      unit: dto.unit.trim(),
      grade: dto.grade?.trim(),
      harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : undefined,
      address: dto.address?.trim(),
      latitude: dto.latitude,
      longitude: dto.longitude,
      governmentPrice: dto.governmentPrice,
      marketPrice: dto.marketPrice,
      minimumPrice: dto.minimumPrice,
      status,
      publishedAt:
        status === ListingStatus.PUBLISHED ? new Date() : undefined,
    });

    return { data: this.toView(data.toObject()) };
  }

  async search(query: SearchListingsDto) {
    const filter: FilterQuery<Listing> = {
      status: { $in: [ListingStatus.PUBLISHED, ListingStatus.RESERVED] },
    };

    if (query.goodCode?.trim()) {
      filter.goodCode = query.goodCode.trim().toLowerCase();
    }
    if (query.address?.trim()) {
      filter.address = new RegExp(this.escape(query.address.trim()), 'i');
    }
    if (query.search?.trim()) {
      filter.$text = { $search: query.search.trim() };
    }
    if (query.minimumPrice != null || query.maximumPrice != null) {
      filter.minimumPrice = {
        ...(query.minimumPrice != null ? { $gte: query.minimumPrice } : {}),
        ...(query.maximumPrice != null ? { $lte: query.maximumPrice } : {}),
      };
    }

    const records = await this.listingModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return { data: records.map((item) => this.toView(item)) };
  }

  async findOne(id: string) {
    const record = await this.listingModel.findById(id).lean();
    if (!record) {
      throw new NotFoundException('Listing not found');
    }
    return { data: this.toView(record) };
  }

  async mine(ownerId: string) {
    const records = await this.listingModel
      .find({ ownerId })
      .sort({ createdAt: -1 })
      .lean();
    return { data: records.map((item) => this.toView(item)) };
  }

  async cancel(id: string, userId: string, role: UserType) {
    const record = await this.listingModel.findById(id);
    if (!record) {
      throw new NotFoundException('Listing not found');
    }
    if (role !== UserType.ADMIN && record.ownerId !== userId) {
      throw new ForbiddenException('You do not own this listing');
    }
    if ([ListingStatus.SOLD, ListingStatus.CANCELLED].includes(record.status)) {
      throw new BadRequestException('Listing cannot be cancelled');
    }
    record.status = ListingStatus.CANCELLED;
    await record.save();
    return { data: this.toView(record.toObject()) };
  }

  async canManage(id: string, userId: string, role: UserType) {
    if (role === UserType.ADMIN) {
      return true;
    }
    return Boolean(await this.listingModel.exists({ _id: id, ownerId: userId }));
  }

  async reserve(id: string, quantity: number) {
    const record = await this.listingModel.findOneAndUpdate(
      {
        _id: id,
        status: { $in: [ListingStatus.PUBLISHED, ListingStatus.RESERVED] },
        $expr: {
          $lte: [{ $add: ['$reservedQuantity', quantity] }, '$quantity'],
        },
      },
      { $inc: { reservedQuantity: quantity } },
      { returnDocument: 'after' },
    );

    if (!record) {
      throw new BadRequestException('Requested quantity is no longer available');
    }

    if (record.reservedQuantity >= record.quantity) {
      record.status = ListingStatus.RESERVED;
      await record.save();
    }

    return record;
  }

  private toView(record: Record<string, any>) {
    return {
      ...record,
      availableQuantity: Math.max(
        0,
        Number(record.quantity ?? 0) - Number(record.reservedQuantity ?? 0),
      ),
    };
  }

  private escape(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
