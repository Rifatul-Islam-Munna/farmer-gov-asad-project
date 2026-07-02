import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
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

  @IsOptional()
  @IsEnum(UserType)
  role?: UserType;
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
