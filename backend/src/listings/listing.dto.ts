import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ListingStatus } from './listing.entity';

export class CreateListingDto {
  @IsString()
  @MaxLength(50)
  goodCode: string;

  @IsString()
  @MaxLength(120)
  goodName: string;

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
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}

export class SearchListingsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  goodCode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumPrice?: number;
}

export class UpdateListingStatusDto {
  @IsEnum(ListingStatus)
  status: ListingStatus;
}
