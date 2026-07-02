import { Type } from 'class-transformer';
import {
  IsBoolean,
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

  @IsNumber()
  latitude: number;

  @IsNumber()
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

export class NearbySellerQueryDto {
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  longitude: number;

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
