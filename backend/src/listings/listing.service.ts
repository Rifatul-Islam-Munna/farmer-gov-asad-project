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
import { CreateListingDto, SearchListingsDto } from './dto/listing.dto';
import { Listing, ListingStatus } from './entities/listing.entity';

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
        goodCode: dto.goodCode.trim().toLowerCase(),
        goodName: dto.goodName.trim(),
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
        status,
        publishedAt: status === ListingStatus.PUBLISHED ? new Date() : null,
      }),
    );
    return { data: this.toView(record) };
  }

  async search(query: SearchListingsDto) {
    const qb = this.listingRepository
      .createQueryBuilder('listing')
      .where('listing.status IN (:...statuses)', {
        statuses: [ListingStatus.PUBLISHED, ListingStatus.RESERVED],
      })
      .orderBy('listing.createdAt', 'DESC')
      .take(100);

    if (query.goodCode?.trim()) {
      qb.andWhere('listing.goodCode = :goodCode', {
        goodCode: query.goodCode.trim().toLowerCase(),
      });
    }
    if (query.address?.trim()) {
      qb.andWhere('listing.address ILIKE :address', {
        address: `%${query.address.trim()}%`,
      });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(listing.goodName ILIKE :search OR listing.goodCode ILIKE :search OR listing.address ILIKE :search)',
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

    return { data: (await qb.getMany()).map((item) => this.toView(item)) };
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
    if (role !== UserType.ADMIN && record.ownerId !== userId) {
      throw new ForbiddenException('You do not own this listing');
    }
    if ([ListingStatus.SOLD, ListingStatus.CANCELLED].includes(record.status)) {
      throw new BadRequestException('Listing cannot be cancelled');
    }
    record.status = ListingStatus.CANCELLED;
    return { data: this.toView(await this.listingRepository.save(record)) };
  }

  async canManage(id: string, userId: string, role: UserType) {
    if (role === UserType.ADMIN) return true;
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
      if (record.reservedQuantity >= record.quantity) {
        record.status = ListingStatus.RESERVED;
      }
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
