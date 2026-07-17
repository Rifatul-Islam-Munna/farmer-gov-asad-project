import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { UserType } from '../../user/entities/user.entity';

export class UpdateVerificationDto {
  @IsString()
  @IsIn(['pending', 'approved', 'rejected'])
  status: 'pending' | 'approved' | 'rejected';
}

export class CreateGuidanceDto {
  @IsString()
  @IsIn(['suggestion', 'notice'])
  type: 'suggestion' | 'notice';

  @IsString()
  @MaxLength(150)
  title: string;

  @IsString()
  @MaxLength(1000)
  message: string;

  @IsString()
  @IsIn(['all', 'farmer', 'buyer', 'agent', 'medicineSeller'])
  targetRole: 'all' | 'farmer' | 'buyer' | 'agent' | 'medicineSeller';

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class AdminSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number;
}

export class AdminUserSearchDto extends AdminSearchDto {
  @IsOptional()
  @IsEnum(UserType)
  role?: UserType;

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  verificationStatus?: 'pending' | 'approved' | 'rejected';
}

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserType)
  role?: UserType;

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  verificationStatus?: 'pending' | 'approved' | 'rejected';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  landAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  shopName?: string;
}

export class AdminUpdateListingDto {
  @IsString()
  @IsIn([
    'draft',
    'pendingOtp',
    'published',
    'reserved',
    'sold',
    'expired',
    'cancelled',
    'rejected',
  ])
  status:
    | 'draft'
    | 'pendingOtp'
    | 'published'
    | 'reserved'
    | 'sold'
    | 'expired'
    | 'cancelled'
    | 'rejected';
}

export class AdminUpdateDealDto {
  @IsString()
  @IsIn(['confirmed', 'completed', 'cancelled', 'disputed'])
  status: 'confirmed' | 'completed' | 'cancelled' | 'disputed';
}

export class AdminUpdateInventoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
