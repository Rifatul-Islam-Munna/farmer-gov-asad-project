import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { UserType } from './user.entity';

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
