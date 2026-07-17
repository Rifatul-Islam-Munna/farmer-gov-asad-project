import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMarketPriceDto {
  @IsString()
  @MaxLength(50)
  goodCode: string;

  @IsString()
  @MaxLength(100)
  goodName: string;

  @IsString()
  @MaxLength(20)
  unit: string;

  @IsNumber()
  @Min(0)
  governmentPrice: number;

  @IsNumber()
  @Min(0)
  marketPrice: number;

  @IsNumber()
  @Min(0)
  previousMarketPrice: number;

  @IsString()
  @MaxLength(100)
  region: string;

  @IsString()
  @MaxLength(120)
  marketName: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsDateString()
  priceDate?: string;
}
