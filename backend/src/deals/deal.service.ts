import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { toApiEntity } from '../lib/database/base.entity';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { ListingService } from '../listings/listing.service';
import { UserType } from '../user/entities/user.entity';
import { Deal, Offer, OfferStatus } from './entities/deal.entity';
import {
  CreateNegotiationDto,
  UpdateNegotiationDto,
} from './dto/negotiation.dto';

@Injectable()
export class DealService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    private readonly listingService: ListingService,
    private readonly dataSource: DataSource,
  ) {}

  async createOffer(buyerId: string, dto: CreateNegotiationDto) {
    const listing = (await this.listingService.findOne(dto.listingId)).data;
    if (listing.ownerId === buyerId) {
      throw new BadRequestException('You cannot offer on your own listing');
    }
    if (dto.quantity > listing.availableQuantity) {
      throw new BadRequestException('Requested quantity is not available');
    }

    const offer = await this.offerRepository.save(
      this.offerRepository.create({
        listingId: dto.listingId,
        buyerId,
        farmerId: listing.ownerId,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        status: OfferStatus.PENDING,
        buyerAccepted: true,
        farmerAccepted: false,
        history: [
          {
            byUserId: buyerId,
            quantity: dto.quantity,
            unitPrice: dto.unitPrice,
            createdAt: new Date().toISOString(),
          },
        ],
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      }),
    );
    return { data: toApiEntity(offer) };
  }

  async counter(
    offerId: string,
    userId: string,
    role: UserType,
    dto: UpdateNegotiationDto,
  ) {
    const offer = await this.findParticipantOffer(offerId, userId, role);
    if (offer.status === OfferStatus.CONFIRMED) {
      throw new BadRequestException('Confirmed offers cannot be changed');
    }
    offer.quantity = dto.quantity;
    offer.unitPrice = dto.unitPrice;
    offer.buyerAccepted = role === UserType.BUYER;
    offer.farmerAccepted = role === UserType.FARMER;
    offer.status = OfferStatus.COUNTERED;
    offer.history = [
      ...offer.history,
      {
        byUserId: userId,
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
        createdAt: new Date().toISOString(),
      },
    ];
    return { data: toApiEntity(await this.offerRepository.save(offer)) };
  }

  async accept(offerId: string, userId: string, role: UserType) {
    const offer = await this.findParticipantOffer(offerId, userId, role);
    if (offer.status === OfferStatus.CONFIRMED) {
      const deal = await this.dealRepository.findOne({ where: { offerId } });
      return { data: deal ? toApiEntity(deal) : null };
    }
    if (
      [
        OfferStatus.REJECTED,
        OfferStatus.CANCELLED,
        OfferStatus.EXPIRED,
      ].includes(offer.status)
    ) {
      throw new BadRequestException('This offer is no longer active');
    }

    if (role === UserType.BUYER) {
      offer.buyerAccepted = true;
      offer.status = OfferStatus.ACCEPTED_BY_BUYER;
    } else {
      offer.farmerAccepted = true;
      offer.status = OfferStatus.ACCEPTED_BY_FARMER;
    }

    if (!offer.buyerAccepted || !offer.farmerAccepted) {
      return { data: toApiEntity(await this.offerRepository.save(offer)) };
    }

    return this.dataSource.transaction(async (manager) => {
      const listingRepository = manager.getRepository(Listing);
      const listing = await listingRepository
        .createQueryBuilder('listing')
        .setLock('pessimistic_write')
        .where('listing.id = :id', { id: offer.listingId })
        .getOne();
      if (
        !listing ||
        ![ListingStatus.PUBLISHED, ListingStatus.RESERVED].includes(
          listing.status,
        ) ||
        listing.reservedQuantity + offer.quantity > listing.quantity
      ) {
        throw new BadRequestException(
          'Requested quantity is no longer available',
        );
      }
      listing.reservedQuantity += offer.quantity;
      if (listing.reservedQuantity >= listing.quantity) {
        listing.status = ListingStatus.RESERVED;
      }
      await listingRepository.save(listing);

      offer.status = OfferStatus.CONFIRMED;
      offer.confirmedAt = new Date();
      await manager.getRepository(Offer).save(offer);

      let deal = await manager.getRepository(Deal).findOne({
        where: { offerId: offer.id },
      });
      if (!deal) {
        deal = await manager.getRepository(Deal).save(
          manager.getRepository(Deal).create({
            offerId: offer.id,
            listingId: offer.listingId,
            buyerId: offer.buyerId,
            farmerId: offer.farmerId,
            quantity: offer.quantity,
            unitPrice: offer.unitPrice,
            totalPrice: offer.quantity * offer.unitPrice,
            status: 'confirmed',
            confirmedAt: offer.confirmedAt,
          }),
        );
      }
      return { data: toApiEntity(deal) };
    });
  }

  async reject(offerId: string, userId: string, role: UserType) {
    const offer = await this.findParticipantOffer(offerId, userId, role);
    if (offer.status === OfferStatus.CONFIRMED) {
      throw new BadRequestException('Confirmed deals cannot be rejected');
    }
    offer.status = OfferStatus.REJECTED;
    return { data: toApiEntity(await this.offerRepository.save(offer)) };
  }

  async offersForUser(userId: string, role: UserType) {
    const where =
      role === UserType.BUYER ? { buyerId: userId } : { farmerId: userId };
    const data = await this.offerRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
    return { data: data.map(toApiEntity) };
  }

  async dealsForUser(userId: string, role: UserType) {
    const where =
      role === UserType.BUYER ? { buyerId: userId } : { farmerId: userId };
    const data = await this.dealRepository.find({
      where,
      order: { confirmedAt: 'DESC' },
    });
    return { data: data.map(toApiEntity) };
  }

  private async findParticipantOffer(
    offerId: string,
    userId: string,
    role: UserType,
  ) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });
    if (!offer) throw new NotFoundException('Offer not found');
    const participant =
      (role === UserType.BUYER && offer.buyerId === userId) ||
      (role === UserType.FARMER && offer.farmerId === userId) ||
      role === UserType.ADMIN;
    if (!participant) {
      throw new ForbiddenException('You are not part of this negotiation');
    }
    return offer;
  }
}
