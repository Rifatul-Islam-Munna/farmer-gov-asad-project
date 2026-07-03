import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ListingService } from '../listings/listing.service';
import { UserType } from '../user/user.entity';
import {
  DEAL_MODEL,
  Deal,
  OFFER_MODEL,
  Offer,
  OfferStatus,
} from './deal.entity';
import {
  CreateNegotiationDto,
  UpdateNegotiationDto,
} from './negotiation.dto';

@Injectable()
export class DealService {
  constructor(
    @InjectModel(OFFER_MODEL)
    private readonly offerModel: Model<Offer>,
    @InjectModel(DEAL_MODEL)
    private readonly dealModel: Model<Deal>,
    private readonly listingService: ListingService,
  ) {}

  async createOffer(buyerId: string, dto: CreateNegotiationDto) {
    const listing = (await this.listingService.findOne(dto.listingId)).data as {
      ownerId: string;
      availableQuantity: number;
    };
    if (listing.ownerId === buyerId) {
      throw new BadRequestException('You cannot offer on your own listing');
    }
    if (dto.quantity > listing.availableQuantity) {
      throw new BadRequestException('Requested quantity is not available');
    }

    const offer = await this.offerModel.create({
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
          createdAt: new Date(),
        },
      ],
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    return { data: offer.toObject() };
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
    offer.history.push({
      byUserId: userId,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      createdAt: new Date(),
    });
    await offer.save();
    return { data: offer.toObject() };
  }

  async accept(offerId: string, userId: string, role: UserType) {
    const offer = await this.findParticipantOffer(offerId, userId, role);
    if (offer.status === OfferStatus.CONFIRMED) {
      const deal = await this.dealModel.findOne({ offerId }).lean();
      return { data: deal };
    }
    if (
      [OfferStatus.REJECTED, OfferStatus.CANCELLED, OfferStatus.EXPIRED].includes(
        offer.status,
      )
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
      await offer.save();
      return { data: offer.toObject() };
    }

    await this.listingService.reserve(offer.listingId, offer.quantity);
    offer.status = OfferStatus.CONFIRMED;
    offer.confirmedAt = new Date();
    await offer.save();

    const deal = await this.dealModel.findOneAndUpdate(
      { offerId: offer.id },
      {
        $setOnInsert: {
          offerId: offer.id,
          listingId: offer.listingId,
          buyerId: offer.buyerId,
          farmerId: offer.farmerId,
          quantity: offer.quantity,
          unitPrice: offer.unitPrice,
          totalPrice: offer.quantity * offer.unitPrice,
          status: 'confirmed',
          confirmedAt: offer.confirmedAt,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );

    return { data: deal };
  }

  async reject(offerId: string, userId: string, role: UserType) {
    const offer = await this.findParticipantOffer(offerId, userId, role);
    if (offer.status === OfferStatus.CONFIRMED) {
      throw new BadRequestException('Confirmed deals cannot be rejected');
    }
    offer.status = OfferStatus.REJECTED;
    await offer.save();
    return { data: offer.toObject() };
  }

  async offersForUser(userId: string, role: UserType) {
    const filter =
      role === UserType.BUYER ? { buyerId: userId } : { farmerId: userId };
    const data = await this.offerModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();
    return { data };
  }

  async dealsForUser(userId: string, role: UserType) {
    const filter =
      role === UserType.BUYER ? { buyerId: userId } : { farmerId: userId };
    const data = await this.dealModel
      .find(filter)
      .sort({ confirmedAt: -1 })
      .lean();
    return { data };
  }

  private async findParticipantOffer(
    offerId: string,
    userId: string,
    role: UserType,
  ) {
    const offer = await this.offerModel.findById(offerId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

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
