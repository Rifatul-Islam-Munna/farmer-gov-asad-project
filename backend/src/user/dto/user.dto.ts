import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserType } from '../entities/user.entity';

export class CreateUserDto {
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

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsEnum(UserType)
  role: UserType;

  @ValidateIf((dto: CreateUserDto) => dto.role === UserType.FARMER)
  @IsNumber()
  @Min(0)
  landAmount?: number;

  @ValidateIf(
    (dto: CreateUserDto) =>
      dto.role === UserType.AGENT ||
      dto.role === UserType.BUYER ||
      dto.role === UserType.MEDICINE_SELLER,
  )
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(150)
  businessName?: string;

  @ValidateIf((dto: CreateUserDto) => dto.role === UserType.MEDICINE_SELLER)
  @IsString()
  @MaxLength(150)
  shopName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;
}

export class UpdateMyProfileDto {
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
  @IsString()
  @MaxLength(30)
  gender?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  landAmount?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(150)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  shopName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;
}

export class UpdateMyLocationDto {
  @Type(() => Number)
  @IsLatitude()
  latitude: number;

  @Type(() => Number)
  @IsLongitude()
  longitude: number;
}

export class LoginDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  @MinLength(6)
  @MaxLength(80)
  password: string;
}

export class OtpStringDto {
  @IsString()
  otp: string;
}

export class FindOneTokenDto {
  @IsString()
  id: string;
}

export class RefreshTokenDto {
  @IsString()
  @MinLength(20)
  refreshToken: string;
}

export class ChangeActiveRoleDto {
  @IsEnum(UserType)
  role: UserType;
}

export class AdminAccountStatusDto {
  @IsString()
  status: 'active' | 'suspended' | 'deleted';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
