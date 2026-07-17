import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import { Repository } from 'typeorm';
import { UpdateIntegrationSettingsDto } from './dto/integration-setting.dto';
import { IntegrationSetting } from './entities/integration-setting.entity';

const SETTINGS_KEY = 'external-integrations';
const MASK_MARKER = '****';

type IntegrationSettings = {
  geminiApiKeys: string[];
  geminiTextModel?: string;
  geminiVisionModel?: string;
  imageEmbeddingProvider?: string;
  imageEmbeddingModel?: string;
  windyApiKey?: string;
  oneSignalAppId?: string;
  oneSignalRestApiKey?: string;
  active: boolean;
};

@Injectable()
export class IntegrationSettingsService {
  constructor(
    @InjectRepository(IntegrationSetting)
    private readonly repository: Repository<IntegrationSetting>,
    private readonly configService: ConfigService,
  ) {}

  async getMasked() {
    const data = await this.getDecrypted();
    return {
      data: {
        ...data,
        geminiApiKeys: data.geminiApiKeys.map((value) => this.mask(value)),
        windyApiKey: data.windyApiKey ? this.mask(data.windyApiKey) : '',
        oneSignalRestApiKey: data.oneSignalRestApiKey
          ? this.mask(data.oneSignalRestApiKey)
          : '',
      },
    };
  }

  async update(userId: string, dto: UpdateIntegrationSettingsDto) {
    const current = await this.getDecrypted();
    const submittedKeys = dto.geminiApiKeys.filter(
      (value) => !value.includes(MASK_MARKER),
    );
    const merged: IntegrationSettings = {
      ...current,
      ...dto,
      geminiApiKeys:
        submittedKeys.length > 0 ? submittedKeys : current.geminiApiKeys,
      windyApiKey: dto.windyApiKey?.includes(MASK_MARKER)
        ? current.windyApiKey
        : dto.windyApiKey,
      oneSignalRestApiKey: dto.oneSignalRestApiKey?.includes(MASK_MARKER)
        ? current.oneSignalRestApiKey
        : dto.oneSignalRestApiKey,
      active: dto.active ?? current.active,
    };

    const encryptedValue = this.encrypt(JSON.stringify(merged));
    await this.repository.upsert(
      {
        key: SETTINGS_KEY,
        encryptedValue,
        valueType: 'json',
        active: merged.active,
        updatedBy: userId,
      },
      ['key'],
    );
    return this.getMasked();
  }

  async getDecrypted(): Promise<IntegrationSettings> {
    const row = await this.repository.findOne({ where: { key: SETTINGS_KEY } });
    if (!row) {
      return { geminiApiKeys: [], active: true };
    }

    try {
      const parsed: unknown = JSON.parse(this.decrypt(row.encryptedValue));
      if (!this.isIntegrationSettings(parsed)) {
        throw new Error('Invalid integration settings payload');
      }
      return parsed;
    } catch {
      throw new InternalServerErrorException(
        'Integration settings cannot be decrypted',
      );
    }
  }

  private isIntegrationSettings(value: unknown): value is IntegrationSettings {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Record<string, unknown>;
    return (
      Array.isArray(candidate.geminiApiKeys) &&
      candidate.geminiApiKeys.every((key) => typeof key === 'string') &&
      typeof candidate.active === 'boolean'
    );
  }

  private encryptionKey() {
    const raw = this.configService.get<string>('CONFIG_ENCRYPTION_KEY');
    if (!raw) {
      throw new InternalServerErrorException(
        'CONFIG_ENCRYPTION_KEY is not configured',
      );
    }
    return createHash('sha256').update(raw).digest();
  }

  private encrypt(value: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey(), iv);
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  private decrypt(value: string) {
    const buffer = Buffer.from(value, 'base64');
    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }

  private mask(value: string) {
    if (value.length <= 8) return '********';
    return `${value.slice(0, 4)}${MASK_MARKER}${value.slice(-4)}`;
  }
}
