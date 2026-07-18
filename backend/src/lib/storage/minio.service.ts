import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client?: S3Client;
  private configured = false;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>(
      'MINIO_BUCKET',
      'agrivision',
    );
  }

  async onModuleInit() {
    const endpoint = this.configService.get<string>('MINIO_URL');
    const accessKeyId = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('MINIO_SECRET_KEY');

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'MinIO is not configured; storage operations are disabled',
      );
      return;
    }

    this.client = new S3Client({
      region: this.configService.get<string>('MINIO_REGION', 'us-east-1'),
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    });

    try {
      await this.ensureBucket();
      if (this.configService.get<string>('MINIO_PUBLIC_BUCKET') === 'true') {
        await this.makeBucketPublic();
      }
      this.configured = true;
      this.logger.log(`MinIO bucket '${this.bucketName}' is ready`);
    } catch (error) {
      this.client = undefined;
      this.logger.error(
        `MinIO initialization failed: ${(error as Error).message}`,
      );
    }
  }

  async uploadFile(file: Express.Multer.File, prefix = 'uploads') {
    const client = this.getClient();
    if (!file?.path || !file.mimetype) {
      throw new HttpException('Invalid upload payload', HttpStatus.BAD_REQUEST);
    }

    const safeName = (file.originalname || file.filename || 'file')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .slice(-120);
    const key = `${prefix}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: createReadStream(file.path),
        ContentType: file.mimetype,
        Metadata: { originalName: encodeURIComponent(file.originalname || '') },
      }),
    );

    return {
      key,
      bucket: this.bucketName,
      url:
        this.configService.get<string>('MINIO_PUBLIC_BUCKET') === 'true'
          ? `${this.publicBaseUrl()}/${this.bucketName}/${key}`
          : await this.getSignedReadUrl(key),
    };
  }

  detectMime(buffer: Buffer) {
    const hex = buffer.subarray(0, 16).toString('hex');
    if (hex.startsWith('ffd8ff')) return { mime: 'image/jpeg', ext: 'jpg' };
    if (hex.startsWith('89504e470d0a1a0a'))
      return { mime: 'image/png', ext: 'png' };
    if (
      hex.startsWith('52494646') &&
      buffer.subarray(8, 12).toString() === 'WEBP'
    ) {
      return { mime: 'image/webp', ext: 'webp' };
    }
    if (hex.startsWith('474946383761') || hex.startsWith('474946383961')) {
      return { mime: 'image/gif', ext: 'gif' };
    }
    if (hex.startsWith('25504446'))
      return { mime: 'application/pdf', ext: 'pdf' };
    if (hex.startsWith('504b0304')) {
      return {
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ext: 'xlsx',
      };
    }
    const sample = buffer.subarray(0, Math.min(buffer.length, 4096));
    if (!sample.includes(0)) {
      const text = sample.toString('utf8');
      if (text.includes(',') || text.includes('\n'))
        return { mime: 'text/csv', ext: 'csv' };
      return { mime: 'text/plain', ext: 'txt' };
    }
    throw new HttpException(
      'Unable to identify file content type',
      HttpStatus.BAD_REQUEST,
    );
  }

  async uploadBuffer(
    buffer: Buffer,
    options: { prefix: string; originalName: string; contentType: string },
  ) {
    if (!buffer.length) {
      throw new HttpException('File is empty', HttpStatus.BAD_REQUEST);
    }
    const safeName = (options.originalName || 'file')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .slice(-120);
    const key = `${options.prefix}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;
    await this.getClient().send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: options.contentType,
      }),
    );
    return {
      key,
      bucket: this.bucketName,
      contentType: options.contentType,
      size: buffer.length,
      url:
        this.configService.get<string>('MINIO_PUBLIC_BUCKET') === 'true'
          ? `${this.publicBaseUrl()}/${this.bucketName}/${key}`
          : await this.getSignedReadUrl(key),
    };
  }

  async getSignedReadUrl(key: string, expiresIn = 900) {
    return getSignedUrl(
      this.getClient(),
      new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
      { expiresIn },
    );
  }

  async getSignedUploadUrl(key: string, contentType: string, expiresIn = 300) {
    if (!key.trim() || !contentType.trim()) {
      throw new HttpException(
        'Object key and content type are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return getSignedUrl(
      this.getClient(),
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn },
    );
  }

  async uploadSanitizedImage(file: Express.Multer.File, prefix = 'images') {
    if (!file?.path || !file.mimetype?.startsWith('image/')) {
      throw new HttpException(
        'A valid image file is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const client = this.getClient();
    const source = await readFile(file.path);
    const id = randomUUID();
    const date = new Date().toISOString().slice(0, 10);
    const originalKey = `${prefix}/${date}/${id}.webp`;
    const thumbnailKey = `${prefix}/${date}/${id}-thumb.webp`;

    const original = await sharp(source)
      .rotate()
      .resize({
        width: 2200,
        height: 2200,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer();
    const thumbnail = await sharp(source)
      .rotate()
      .resize({ width: 480, height: 480, fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    await Promise.all([
      client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: originalKey,
          Body: original,
          ContentType: 'image/webp',
        }),
      ),
      client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: thumbnailKey,
          Body: thumbnail,
          ContentType: 'image/webp',
        }),
      ),
    ]);

    return {
      originalKey,
      thumbnailKey,
      originalUrl: await this.getSignedReadUrl(originalKey),
      thumbnailUrl: await this.getSignedReadUrl(thumbnailKey),
      metadataStripped: true,
    };
  }

  async deleteObjects(keys: string[]) {
    const uniqueKeys = [
      ...new Set(keys.map((key) => key.trim()).filter(Boolean)),
    ];
    await Promise.all(
      uniqueKeys.map((key) =>
        this.getClient().send(
          new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }),
        ),
      ),
    );
    return { deletedKeys: uniqueKeys };
  }

  status() {
    return {
      configured: Boolean(
        this.configService.get<string>('MINIO_URL') &&
        this.configService.get<string>('MINIO_ACCESS_KEY') &&
        this.configService.get<string>('MINIO_SECRET_KEY'),
      ),
      available: this.configured,
      bucket: this.bucketName,
    };
  }

  async deleteService(key: string) {
    if (!key?.trim()) {
      throw new HttpException('Invalid object key', HttpStatus.BAD_REQUEST);
    }
    await this.getClient().send(
      new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }),
    );
    return true;
  }

  private async ensureBucket() {
    const client = this.getClient();
    try {
      await client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
    } catch {
      await client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
    }
  }

  private async makeBucketPublic() {
    await this.getClient().send(
      new PutBucketPolicyCommand({
        Bucket: this.bucketName,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicRead',
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        }),
      }),
    );
  }

  private getClient() {
    if (!this.client) {
      throw new HttpException(
        'Object storage is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return this.client;
  }

  private publicBaseUrl() {
    return (
      this.configService.get<string>('MINIO_PUBLIC_URL') ??
      this.configService.get<string>('MINIO_URL') ??
      ''
    ).replace(/\/+$/, '');
  }
}
