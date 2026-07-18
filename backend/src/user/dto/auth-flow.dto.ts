import { IsString, MaxLength, MinLength } from 'class-validator';

export class VerificationCodeDto {
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;
}

export class PasswordResetRequestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  destination: string;
}

export class PasswordResetConfirmDto extends PasswordResetRequestDto {
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
