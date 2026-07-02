import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

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
