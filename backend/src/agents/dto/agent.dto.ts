import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CreateListingDto } from '../../listings/dto/listing.dto';

export class AgentCreateFarmerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  @MinLength(6)
  @MaxLength(80)
  password: string;

  @IsNumber()
  @Min(0)
  landAmount: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;
}

export class AgentListingRequestDto extends CreateListingDto {
  @IsString()
  farmerPhone: string;
}

export class VerifyAgentActionDto {
  @IsString()
  actionId: string;

  @IsString()
  otp: string;
}

export class SearchFarmersDto {
  @IsOptional()
  @IsString()
  search?: string;
}
