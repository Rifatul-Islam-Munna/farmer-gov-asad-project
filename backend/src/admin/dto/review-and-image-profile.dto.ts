import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { UserType } from '../../user/entities/user.entity';

export class ReviewDocumentDto {
  @IsString() @MaxLength(80) key: string;
  @IsString() @MaxLength(160) label: string;
  @IsUrl({ require_tld: false }) url: string;
}

export class SubmitProfessionalReviewDto {
  @IsEnum(UserType) role: UserType;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ReviewDocumentDto)
  documents: ReviewDocumentDto[];
  @IsObject() checklist: Record<string, boolean>;
}

export class ReviewProfessionalAccountDto {
  @IsEnum(['pending', 'inReview', 'approved', 'rejected'] as const)
  status: 'pending' | 'inReview' | 'approved' | 'rejected';
  @IsOptional() @IsString() @MaxLength(2000) reviewerNote?: string;
  @IsOptional() @IsObject() checklist?: Record<string, boolean>;
  @IsOptional()
  @IsObject()
  documentDecisions?: Record<
    string,
    { status: 'approved' | 'rejected'; note?: string }
  >;
}

export class CreateImageProfileDto {
  @IsString() @MaxLength(120) code: string;
  @IsString() @MaxLength(180) name: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsString() @MaxLength(120) diseaseCode?: string;
  @IsOptional() @IsString() @MaxLength(120) cropCode?: string;
  @IsOptional() @IsString() @MaxLength(120) embeddingProvider?: string;
  @IsOptional() @IsString() @MaxLength(180) embeddingModel?: string;
  @IsOptional() @IsString() @MaxLength(180) qdrantCollection?: string;
}

export class ImageProfileItemDto {
  @IsString() @MaxLength(500) objectKey: string;
  @IsOptional() @IsString() @MaxLength(500) thumbnailKey?: string;
  @IsString() @MaxLength(255) originalName: string;
  @IsString() @MaxLength(120) contentType: string;
  @IsInt() @Min(1) @Max(50 * 1024 * 1024) sizeBytes: number;
  @IsOptional() @IsString() @MaxLength(128) checksum?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(1) qualityScore?: number;
}

export class BulkRegisterImageProfileItemsDto {
  @IsArray()
  @ArrayMinSize(10)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ImageProfileItemDto)
  items: ImageProfileItemDto[];
}

export class UpdateImageProfileItemDto {
  @IsEnum(['pending', 'ready', 'duplicate', 'rejected', 'failed'] as const)
  status: 'pending' | 'ready' | 'duplicate' | 'rejected' | 'failed';
  @IsOptional() @IsNumber() @Min(0) @Max(1) qualityScore?: number;
  @IsOptional() @IsString() @MaxLength(1000) error?: string;
}

export class ImageProfilePresignDto {
  @IsString() @MaxLength(255) fileName: string;
  @IsString() @MaxLength(120) contentType: string;
  @IsInt() @Min(1) @Max(50 * 1024 * 1024) sizeBytes: number;
}

export class QueueJobDto {
  @IsOptional() @IsString() @MaxLength(120) jobId?: string;
  @IsOptional() @IsBoolean() force?: boolean;
}
