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
import { randomUUID } from 'crypto';
import { GetObjectCommand } from '@aws-sdk/client-s3';

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

  async getSignedReadUrl(key: string, expiresIn = 900) {
    return getSignedUrl(
      this.getClient(),
      new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
      { expiresIn },
    );
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
