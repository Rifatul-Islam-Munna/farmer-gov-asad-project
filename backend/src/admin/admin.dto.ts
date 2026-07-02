import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ListingStatus } from '../listings/listing.entity';
import { UserType } from '../user/user.entity';

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

export class AdminPageQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

export class AdminUserQueryDto extends AdminPageQueryDto {
  @IsOptional()
  @IsEnum(UserType)
  role?: UserType;

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  verificationStatus?: 'pending' | 'approved' | 'rejected';

  @IsOptional()
  @IsIn(['true', 'false'])
  isActive?: 'true' | 'false';
}

export class UpdateAdminUserDto {
  @IsOptional()
  @IsEnum(UserType)
  role?: UserType;

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  verificationStatus?: 'pending' | 'approved' | 'rejected';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminListingQueryDto extends AdminPageQueryDto {
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}

export class UpdateListingStatusDto {
  @IsEnum(ListingStatus)
  status: ListingStatus;
}

export class AdminDealQueryDto extends AdminPageQueryDto {
  @IsOptional()
  @IsIn(['confirmed', 'completed', 'cancelled', 'disputed'])
  status?: 'confirmed' | 'completed' | 'cancelled' | 'disputed';
}

export class UpdateDealStatusDto {
  @IsIn(['confirmed', 'completed', 'cancelled', 'disputed'])
  status: 'confirmed' | 'completed' | 'cancelled' | 'disputed';
}