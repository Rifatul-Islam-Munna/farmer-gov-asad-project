import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { toApiEntity } from '../lib/database/base.entity';
import { UserType } from '../user/entities/user.entity';
import { CreateListingDto } from './dto/listing.dto';
import { ListingSearchDto } from './dto/listing-search.dto';
import {
  Listing,
  ListingStatus,
  ListingTransactionType,
  MarketplaceCategory,
} from './entities/listing.entity';

@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    private readonly dataSource: DataSource,
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
    const record = await this.listingRepository.save(
      this.listingRepository.create({
        ownerId,
        assistingAgentId,
        category: dto.category ?? MarketplaceCategory.AGRICULTURAL_OUTPUT,
        transactionType: dto.transactionType ?? ListingTransactionType.SALE,
        goodCode: dto.goodCode.trim().toLowerCase(),
        goodName: dto.goodName.trim(),
        description: dto.description?.trim(),
        imageUrls: dto.imageUrls ?? [],
        quantity: dto.quantity,
        reservedQuantity: 0,
        unit: dto.unit.trim(),
        grade: dto.grade?.trim(),
        harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : null,
        address: dto.address?.trim(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        governmentPrice: dto.governmentPrice,
        marketPrice: dto.marketPrice,
        minimumPrice: dto.minimumPrice,
        negotiable: dto.negotiable ?? true,
        deliveryAvailable: dto.deliveryAvailable ?? false,
        status,
        publishedAt: status === ListingStatus.PUBLISHED ? new Date() : null,
      }),
    );
    return { data: this.toView(record) };
  }

  async search(query: ListingSearchDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const qb = this.listingRepository
      .createQueryBuilder('listing')
      .where('listing.status IN (:...statuses)', {
        statuses: [ListingStatus.PUBLISHED, ListingStatus.RESERVED],
      });

    if (query.goodCode?.trim()) {
      qb.andWhere('listing.goodCode = :goodCode', {
        goodCode: query.goodCode.trim().toLowerCase(),
      });
    }
    if (query.category)
      qb.andWhere('listing.category = :category', { category: query.category });
    if (query.transactionType) {
      qb.andWhere('listing.transactionType = :transactionType', {
        transactionType: query.transactionType,
      });
    }
    if (query.address?.trim()) {
      qb.andWhere('listing.address ILIKE :address', {
        address: `%${query.address.trim()}%`,
      });
    }
    if (query.grade?.trim()) {
      qb.andWhere('listing.grade ILIKE :grade', {
        grade: `%${query.grade.trim()}%`,
      });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(listing.goodName ILIKE :search OR listing.goodCode ILIKE :search OR listing.description ILIKE :search OR listing.address ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }
    if (query.minimumPrice != null) {
      qb.andWhere('listing.minimumPrice >= :minimumPrice', {
        minimumPrice: query.minimumPrice,
      });
    }
    if (query.maximumPrice != null) {
      qb.andWhere('listing.minimumPrice <= :maximumPrice', {
        maximumPrice: query.maximumPrice,
      });
    }
    if (query.minimumQuantity != null) {
      qb.andWhere(
        '(listing.quantity - listing.reservedQuantity) >= :minimumQuantity',
        {
          minimumQuantity: query.minimumQuantity,
        },
      );
    }
    if (query.deliveryAvailable != null) {
      qb.andWhere('listing.deliveryAvailable = :deliveryAvailable', {
        deliveryAvailable: query.deliveryAvailable,
      });
    }
    if (query.negotiable != null) {
      qb.andWhere('listing.negotiable = :negotiable', {
        negotiable: query.negotiable,
      });
    }
    if (query.harvestFrom) {
      qb.andWhere('listing.harvestDate >= :harvestFrom', {
        harvestFrom: new Date(query.harvestFrom),
      });
    }
    if (query.harvestTo) {
      qb.andWhere('listing.harvestDate <= :harvestTo', {
        harvestTo: new Date(query.harvestTo),
      });
    }

    switch (query.sortBy) {
      case 'priceLow':
        qb.orderBy('listing.minimumPrice', 'ASC').addOrderBy(
          'listing.id',
          'ASC',
        );
        break;
      case 'priceHigh':
        qb.orderBy('listing.minimumPrice', 'DESC').addOrderBy(
          'listing.id',
          'DESC',
        );
        break;
      case 'quantityHigh':
        qb.orderBy(
          '(listing.quantity - listing.reservedQuantity)',
          'DESC',
        ).addOrderBy('listing.id', 'DESC');
        break;
      default:
        qb.orderBy('listing.createdAt', 'DESC').addOrderBy(
          'listing.id',
          'DESC',
        );
    }

    qb.skip((page - 1) * pageSize).take(pageSize);
    const [records, total] = await qb.getManyAndCount();
    return {
      data: records.map((item) => this.toView(item)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        hasNextPage: page * pageSize < total,
      },
    };
  }

  async findOne(id: string) {
    const record = await this.listingRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Listing not found');
    return { data: this.toView(record) };
  }

  async mine(ownerId: string) {
    const records = await this.listingRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
    return { data: records.map((item) => this.toView(item)) };
  }

  async cancel(id: string, userId: string, role: UserType) {
    const record = await this.listingRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Listing not found');
    if (
      ![UserType.ADMIN, UserType.SUPER_ADMIN].includes(role) &&
      record.ownerId !== userId
    ) {
      throw new ForbiddenException('You do not own this listing');
    }
    if ([ListingStatus.SOLD, ListingStatus.CANCELLED].includes(record.status)) {
      throw new BadRequestException('Listing cannot be cancelled');
    }
    record.status = ListingStatus.CANCELLED;
    return { data: this.toView(await this.listingRepository.save(record)) };
  }

  async canManage(id: string, userId: string, role: UserType) {
    if ([UserType.ADMIN, UserType.SUPER_ADMIN].includes(role)) return true;
    return this.listingRepository.exists({ where: { id, ownerId: userId } });
  }

  async reserve(id: string, quantity: number) {
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(Listing);
      const record = await repository
        .createQueryBuilder('listing')
        .setLock('pessimistic_write')
        .where('listing.id = :id', { id })
        .getOne();

      if (
        !record ||
        ![ListingStatus.PUBLISHED, ListingStatus.RESERVED].includes(
          record.status,
        ) ||
        record.reservedQuantity + quantity > record.quantity
      ) {
        throw new BadRequestException(
          'Requested quantity is no longer available',
        );
      }

      record.reservedQuantity += quantity;
      if (record.reservedQuantity >= record.quantity)
        record.status = ListingStatus.RESERVED;
      return repository.save(record);
    });
  }

  private toView(record: Listing) {
    return {
      ...toApiEntity(record),
      availableQuantity: Math.max(0, record.quantity - record.reservedQuantity),
    };
  }
}
