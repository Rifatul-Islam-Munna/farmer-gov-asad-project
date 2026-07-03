import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateSellerLocationDto {
  @IsString()
  @MaxLength(150)
  shopName: string;

  @IsString()
  @MaxLength(300)
  address: string;

  @Type(() => Number)
  @IsLatitude()
  latitude: number;

  @Type(() => Number)
  @IsLongitude()
  longitude: number;
}

export class UpsertInventoryDto {
  @IsString()
  medicineCode: string;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsString()
  @MaxLength(30)
  unit: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class NearbySellerFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  radiusKm?: number;

  @IsOptional()
  @IsString()
  medicineCode?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class NearbySellerQueryDto extends NearbySellerFilterDto {
  @Type(() => Number)
  @IsLatitude()
  latitude: number;

  @Type(() => Number)
  @IsLongitude()
  longitude: number;
}
