import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  ListingTransactionType,
  MarketplaceCategory,
} from '../entities/listing.entity';

export class ListingSearchDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() goodCode?: string;
  @IsOptional() @IsEnum(MarketplaceCategory) category?: MarketplaceCategory;
  @IsOptional()
  @IsEnum(ListingTransactionType)
  transactionType?: ListingTransactionType;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() grade?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minimumPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maximumPrice?: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumQuantity?: number;
  @IsOptional() @Type(() => Boolean) @IsBoolean() deliveryAvailable?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() negotiable?: boolean;
  @IsOptional() @IsDateString() harvestFrom?: string;
  @IsOptional() @IsDateString() harvestTo?: string;
  @IsOptional()
  @IsIn(['newest', 'priceLow', 'priceHigh', 'quantityHigh'])
  sortBy = 'newest';
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) pageSize = 20;
}
