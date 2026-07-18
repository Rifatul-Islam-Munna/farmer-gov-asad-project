import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMarketplaceProductDto {
  @IsString() categoryCode!: string;
  @IsOptional() @IsString() subcategoryCode?: string;
  @IsString() @MaxLength(180) title!: string;
  @IsString() description!: string;
  @IsOptional() @IsString() useCases?: string;
  @IsOptional() @IsString() symptoms?: string;
  @IsOptional() @IsString() safetyNotes?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) imageUrls?: string[];
  @IsOptional() @IsObject() specifications?: Record<string, unknown>;
  @IsOptional() @IsString() machineryBrand?: string;
  @IsOptional() @IsString() machineryModel?: string;
  @IsOptional() @IsInt() @Min(1900) @Max(2100) machineryYear?: number;
  @IsOptional() @IsNumber() @Min(0) machineryPowerHp?: number;
  @IsNumber() @Min(0) price!: number;
  @IsInt() @Min(0) stock!: number;
  @IsOptional() @IsIn(['sale', 'rental', 'auction']) transactionType?:
    'sale' | 'rental' | 'auction';
  @IsOptional() @IsNumber() @Min(0) rentalDailyRate?: number;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
  @IsOptional() @IsBoolean() restrictedProduct?: boolean;
  @IsOptional() @IsBoolean() requiresLicense?: boolean;
}

export class MarketplaceSearchDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() categoryCode?: string;
  @IsOptional() @IsString() transactionType?: string;
  @IsOptional() @Type(() => Number) @IsNumber() minPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() maxPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() latitude?: number;
  @IsOptional() @Type(() => Number) @IsNumber() longitude?: number;
  @IsOptional() @Type(() => Number) @IsNumber() radiusKm?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
  @IsOptional()
  @IsIn(['relevance', 'newest', 'priceAsc', 'priceDesc', 'distance'])
  sort?: string;
}

export class CartItemDto {
  @IsString() productId!: string;
  @IsInt() @Min(1) quantity!: number;
}
export class CheckoutDto {
  @IsObject() deliveryAddress!: Record<string, unknown>;
  @IsOptional() @IsString() paymentProvider?: string;
}
export class FavoriteDto {
  @IsString() productId!: string;
}
export class SavedSearchDto {
  @IsString() name!: string;
  @IsObject() filters!: Record<string, unknown>;
}
export class RentalBookingDto {
  @IsString() productId!: string;
  @IsDateString() startsAt!: string;
  @IsDateString() endsAt!: string;
}
export class BulkRequestDto {
  @IsString() title!: string;
  @IsString() description!: string;
  @IsString() categoryCode!: string;
  @IsNumber() @Min(0.01) quantity!: number;
  @IsString() unit!: string;
  @IsOptional() @IsDateString() neededBy?: string;
}
export class BulkOfferDto {
  @IsNumber() @Min(0.01) unitPrice!: number;
  @IsNumber() @Min(0.01) availableQuantity!: number;
  @IsString() unit!: string;
  @IsInt() @Min(0) @Max(365) deliveryDays!: number;
  @IsOptional() @IsString() @MaxLength(1000) note?: string;
}
export class AuctionDto {
  @IsString() productId!: string;
  @IsNumber() @Min(0) startingPrice!: number;
  @IsOptional() @IsNumber() reservePrice?: number;
  @IsDateString() startsAt!: string;
  @IsDateString() endsAt!: string;
}
export class BidDto {
  @IsNumber() @Min(0.01) amount!: number;
}
export class MessageDto {
  @IsString() receiverId!: string;
  @IsOptional() @IsString() productId?: string;
  @IsString() @MaxLength(2000) message!: string;
}
export class ReviewDto {
  @IsString() orderId!: string;
  @IsString() productId!: string;
  @IsInt() @Min(1) @Max(5) rating!: number;
  @IsOptional() @IsString() comment?: string;
}
export class ModerateProductDto {
  @IsIn(['published', 'rejected', 'suspended']) status!:
    'published' | 'rejected' | 'suspended';
  @IsString() @MaxLength(1000) reason!: string;
  @IsOptional() @IsBoolean() licenseVerified?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) evidenceUrls?: string[];
  @IsOptional() @IsString() @MaxLength(2000) auditNotes?: string;
}
export class AppealDto {
  @IsString() @MaxLength(2000) message!: string;
}
export class VoiceSearchDto {
  @IsString() transcript!: string;
  @IsOptional() @IsString() language?: string;
}
