import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Max, Min } from 'class-validator';
import { memoryStorage } from 'multer';
import {
  AccessTokenGuard,
  AuthenticatedRequest,
} from '../../auth/access-token.guard';
import { MinioService } from './minio.service';

const FEATURES = [
  'profile',
  'listing',
  'moderation',
  'cms',
  'advertisement',
  'support',
  'report',
  'image-profile',
] as const;
type UploadFeature = (typeof FEATURES)[number];

const POLICIES: Record<UploadFeature, { maxBytes: number; mime: RegExp }> = {
  profile: { maxBytes: 5 * 1024 * 1024, mime: /^image\/(jpeg|png|webp)$/ },
  listing: { maxBytes: 12 * 1024 * 1024, mime: /^image\/(jpeg|png|webp)$/ },
  moderation: {
    maxBytes: 15 * 1024 * 1024,
    mime: /^(image\/(jpeg|png|webp)|application\/pdf)$/,
  },
  cms: {
    maxBytes: 15 * 1024 * 1024,
    mime: /^(image\/(jpeg|png|webp)|application\/pdf)$/,
  },
  advertisement: {
    maxBytes: 10 * 1024 * 1024,
    mime: /^image\/(jpeg|png|webp|gif)$/,
  },
  support: {
    maxBytes: 15 * 1024 * 1024,
    mime: /^(image\/(jpeg|png|webp)|application\/pdf|text\/plain)$/,
  },
  report: {
    maxBytes: 25 * 1024 * 1024,
    mime: /^(application\/pdf|text\/csv|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/,
  },
  'image-profile': {
    maxBytes: 20 * 1024 * 1024,
    mime: /^image\/(jpeg|png|webp)$/,
  },
};

class PresignUploadDto {
  @IsIn(FEATURES)
  feature!: UploadFeature;

  @IsString()
  fileName!: string;

  @IsString()
  contentType!: string;

  @IsInt()
  @Min(1)
  @Max(25 * 1024 * 1024)
  size!: number;
}

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly minio: MinioService) {}

  @Post('presign')
  presign(@Body() dto: PresignUploadDto, @Req() request: AuthenticatedRequest) {
    const policy = this.policy(dto.feature);
    this.assertPolicy(policy, dto.contentType, dto.size);
    const safeName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-120);
    const key = `${dto.feature}/${request.user.id}/${Date.now()}-${safeName}`;
    return this.minio
      .getSignedUploadUrl(key, dto.contentType, 300)
      .then((url) => ({
        key,
        url,
        expiresIn: 300,
        maxBytes: policy.maxBytes,
        allowedMimePattern: policy.mime.source,
      }));
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['feature', 'file'],
      properties: {
        feature: { type: 'string', enum: [...FEATURES] },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  async upload(
    @Body('feature') feature: UploadFeature,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!FEATURES.includes(feature))
      throw new BadRequestException('Unsupported upload feature');
    if (!file?.buffer?.length)
      throw new BadRequestException('File is required');
    const policy = this.policy(feature);
    const detected = this.minio.detectMime(file.buffer);
    this.assertPolicy(policy, detected.mime, file.size);
    if (file.mimetype && file.mimetype !== detected.mime) {
      throw new BadRequestException(
        'Declared MIME type does not match file content',
      );
    }
    return this.minio.uploadBuffer(file.buffer, {
      prefix: `${feature}/${request.user.id}`,
      originalName: file.originalname,
      contentType: detected.mime,
    });
  }

  private policy(feature: UploadFeature) {
    return POLICIES[feature];
  }

  private assertPolicy(
    policy: { maxBytes: number; mime: RegExp },
    mime: string,
    size: number,
  ) {
    if (!policy.mime.test(mime))
      throw new BadRequestException(
        'File type is not allowed for this feature',
      );
    if (size > policy.maxBytes)
      throw new BadRequestException(
        `File exceeds ${policy.maxBytes} byte limit`,
      );
  }
}
