import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ListingStatus,
  ListingTransactionType,
  MarketplaceCategory,
} from '../entities/listing.entity';

export class CreateListingDto {
  @IsOptional()
  @IsEnum(MarketplaceCategory)
  category?: MarketplaceCategory;

  @IsOptional()
  @IsEnum(ListingTransactionType)
  transactionType?: ListingTransactionType;

  @IsString()
  @MaxLength(50)
  goodCode: string;

  @IsString()
  @MaxLength(120)
  goodName: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  imageUrls?: string[];

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsString()
  @MaxLength(20)
  unit: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  grade?: string;

  @IsOptional()
  @IsDateString()
  harvestDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsNumber()
  @Min(0)
  governmentPrice: number;

  @IsNumber()
  @Min(0)
  marketPrice: number;

  @IsNumber()
  @Min(0)
  minimumPrice: number;

  @IsOptional()
  @IsBoolean()
  negotiable?: boolean;

  @IsOptional()
  @IsBoolean()
  deliveryAvailable?: boolean;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}

export class UpdateListingStatusDto {
  @IsEnum(ListingStatus)
  status: ListingStatus;
}
