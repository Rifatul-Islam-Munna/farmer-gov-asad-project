import { IsString, MaxLength, MinLength } from 'class-validator';

export class SupportImpersonationDto {
  @IsString()
  targetUserId!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason!: string;
}
