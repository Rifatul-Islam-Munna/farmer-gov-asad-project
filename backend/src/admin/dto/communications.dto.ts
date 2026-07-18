import { IsBoolean, IsDateString, IsIn, IsOptional, IsString, IsUrl, IsUUID, MaxLength, MinLength } from 'class-validator';

export class UpdateGuidanceDto {
  @IsOptional() @IsString() @MaxLength(220) title?: string;
  @IsOptional() @IsString() message?: string;
  @IsOptional() @IsIn(['suggestion','notice']) type?: 'suggestion'|'notice';
  @IsOptional() @IsIn(['all','farmer','buyer','agent','medicineSeller']) targetRole?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsIn(['draft','scheduled','published','expired']) status?: string;
  @IsOptional() @IsDateString() publishAt?: string | null;
  @IsOptional() @IsDateString() expiresAt?: string | null;
  @IsOptional() @IsUrl() attachmentUrl?: string | null;
}
export class CreateAdvertisementDto {
  @IsString() @MinLength(1) @MaxLength(180) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUrl() imageUrl?: string;
  @IsOptional() @IsUrl() destinationUrl?: string;
  @IsOptional() @IsString() targetRole?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
}
export class UpdateAdvertisementDto extends CreateAdvertisementDto {}
export class CreateSupportTicketDto {
  @IsString() @MinLength(1) @MaxLength(180) subject!: string;
  @IsString() @MinLength(1) message!: string;
  @IsOptional() @IsIn(['low','normal','high','urgent']) priority?: string;
}
export class UpdateSupportTicketDto {
  @IsOptional() @IsIn(['open','in_progress','waiting','resolved','closed']) status?: string;
  @IsOptional() @IsIn(['low','normal','high','urgent']) priority?: string;
  @IsOptional() @IsUUID() assignedTo?: string | null;
  @IsOptional() @IsString() adminNote?: string | null;
}
