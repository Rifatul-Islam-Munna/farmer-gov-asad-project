import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
} from 'crypto';
import { Repository } from 'typeorm';
import {
  TestProviderDto,
  UpdateIntegrationSettingsDto,
} from './dto/integration-setting.dto';
import { IntegrationSetting } from './entities/integration-setting.entity';

const SETTINGS_KEY = 'external-integrations';
const MASK_MARKER = '****';

type ProviderKeyState = {
  id: string;
  key: string;
  enabled: boolean;
  priority: number;
  health: 'unknown' | 'healthy' | 'degraded' | 'quota' | 'failed';
  lastSuccessAt?: string;
  lastQuotaErrorAt?: string;
  cooldownUntil?: string;
  usageCount: number;
  lastTestedAt?: string;
  lastError?: string;
};

type IntegrationSettings = {
  geminiApiKeys: ProviderKeyState[];
  geminiTextModel?: string;
  geminiVisionModel?: string;
  imageEmbeddingProvider?: string;
  imageEmbeddingModel?: string;
  windyApiKey?: string;
  windyHealth?: Omit<ProviderKeyState, 'id' | 'key' | 'priority' | 'enabled'>;
  oneSignalAppId?: string;
  oneSignalRestApiKey?: string;
  oneSignalHealth?: Omit<
    ProviderKeyState,
    'id' | 'key' | 'priority' | 'enabled'
  >;
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
        geminiApiKeys: data.geminiApiKeys
          .sort((a, b) => a.priority - b.priority)
          .map((item) => ({ ...item, key: this.mask(item.key) })),
        windyApiKey: data.windyApiKey ? this.mask(data.windyApiKey) : '',
        oneSignalRestApiKey: data.oneSignalRestApiKey
          ? this.mask(data.oneSignalRestApiKey)
          : '',
      },
    };
  }

  async update(userId: string, dto: UpdateIntegrationSettingsDto) {
    const current = await this.getDecrypted();
    const currentById = new Map(
      current.geminiApiKeys.map((item) => [item.id, item]),
    );
    const geminiApiKeys = dto.geminiApiKeys.map((submitted, index) => {
      const existing = submitted.id ? currentById.get(submitted.id) : undefined;
      const key = submitted.key.includes(MASK_MARKER)
        ? existing?.key
        : submitted.key;
      if (!key)
        throw new BadRequestException('A new Gemini key value is required');
      return {
        id: existing?.id ?? submitted.id ?? randomUUID(),
        key,
        enabled: submitted.enabled ?? existing?.enabled ?? true,
        priority: submitted.priority ?? existing?.priority ?? (index + 1) * 100,
        health: existing?.health ?? ('unknown' as const),
        lastSuccessAt: existing?.lastSuccessAt,
        lastQuotaErrorAt: existing?.lastQuotaErrorAt,
        cooldownUntil: existing?.cooldownUntil,
        usageCount: existing?.usageCount ?? 0,
        lastTestedAt: existing?.lastTestedAt,
        lastError: existing?.lastError,
      };
    });

    const merged: IntegrationSettings = {
      ...current,
      ...dto,
      geminiApiKeys,
      windyApiKey: dto.windyApiKey?.includes(MASK_MARKER)
        ? current.windyApiKey
        : dto.windyApiKey,
      oneSignalRestApiKey: dto.oneSignalRestApiKey?.includes(MASK_MARKER)
        ? current.oneSignalRestApiKey
        : dto.oneSignalRestApiKey,
      active: dto.active ?? current.active,
    };
    await this.save(userId, merged);
    return this.getMasked();
  }

  async testProvider(userId: string, dto: TestProviderDto) {
    const settings = await this.getDecrypted();
    if (dto.provider === 'gemini') {
      const key = settings.geminiApiKeys.find((item) => item.id === dto.keyId);
      if (!key) throw new BadRequestException('Gemini key not found');
      if (!key.enabled) throw new BadRequestException('Gemini key is disabled');
      await this.runTest(
        () =>
          fetch(
            'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1',
            {
              headers: { 'x-goog-api-key': key.key },
              signal: AbortSignal.timeout(8000),
            },
          ),
        key,
      );
      await this.save(userId, settings);
      return this.getMasked();
    }

    if (dto.provider === 'windy') {
      if (!settings.windyApiKey)
        throw new BadRequestException('Windy key is not configured');
      settings.windyHealth ??= this.emptyHealth();
      await this.runTest(
        () =>
          fetch('https://api.windy.com/api/point-forecast/v2', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              lat: 23.8103,
              lon: 90.4125,
              model: 'gfs',
              parameters: ['temp'],
              levels: ['surface'],
              key: settings.windyApiKey,
            }),
            signal: AbortSignal.timeout(8000),
          }),
        settings.windyHealth,
      );
      await this.save(userId, settings);
      return this.getMasked();
    }

    if (!settings.oneSignalAppId || !settings.oneSignalRestApiKey) {
      throw new BadRequestException(
        'OneSignal App ID and REST API key are required',
      );
    }
    settings.oneSignalHealth ??= this.emptyHealth();
    await this.runTest(
      () =>
        fetch(
          `https://api.onesignal.com/apps/${encodeURIComponent(settings.oneSignalAppId!)}`,
          {
            headers: { Authorization: `Key ${settings.oneSignalRestApiKey}` },
            signal: AbortSignal.timeout(8000),
          },
        ),
      settings.oneSignalHealth,
    );
    await this.save(userId, settings);
    return this.getMasked();
  }

  async getDecrypted(): Promise<IntegrationSettings> {
    const row = await this.repository.findOne({ where: { key: SETTINGS_KEY } });
    if (!row) return { geminiApiKeys: [], active: true };
    try {
      const parsed = JSON.parse(this.decrypt(row.encryptedValue)) as Record<
        string,
        unknown
      >;
      const rawKeys = Array.isArray(parsed.geminiApiKeys)
        ? parsed.geminiApiKeys
        : [];
      const geminiApiKeys: ProviderKeyState[] = rawKeys.map((value, index) => {
        if (typeof value === 'string') {
          return {
            id: randomUUID(),
            key: value,
            enabled: true,
            priority: (index + 1) * 100,
            health: 'unknown',
            usageCount: 0,
          };
        }
        const item = value as Partial<ProviderKeyState>;
        return {
          id: item.id ?? randomUUID(),
          key: item.key ?? '',
          enabled: item.enabled ?? true,
          priority: item.priority ?? (index + 1) * 100,
          health: item.health ?? 'unknown',
          usageCount: item.usageCount ?? 0,
          lastSuccessAt: item.lastSuccessAt,
          lastQuotaErrorAt: item.lastQuotaErrorAt,
          cooldownUntil: item.cooldownUntil,
          lastTestedAt: item.lastTestedAt,
          lastError: item.lastError,
        };
      });
      return {
        ...(parsed as IntegrationSettings),
        geminiApiKeys,
        active: typeof parsed.active === 'boolean' ? parsed.active : true,
      };
    } catch {
      throw new InternalServerErrorException(
        'Integration settings cannot be decrypted',
      );
    }
  }

  private async runTest(
    request: () => Promise<Response>,
    state: Pick<
      ProviderKeyState,
      | 'health'
      | 'lastSuccessAt'
      | 'lastQuotaErrorAt'
      | 'cooldownUntil'
      | 'usageCount'
      | 'lastTestedAt'
      | 'lastError'
    >,
  ) {
    state.lastTestedAt = new Date().toISOString();
    state.usageCount += 1;
    try {
      const response = await request();
      if (response.status === 429) {
        state.health = 'quota';
        state.lastQuotaErrorAt = new Date().toISOString();
        state.cooldownUntil = new Date(Date.now() + 15 * 60_000).toISOString();
        state.lastError = 'Provider quota or rate limit reached';
        return;
      }
      if (!response.ok) {
        state.health = response.status >= 500 ? 'degraded' : 'failed';
        state.lastError = `Provider validation failed with HTTP ${response.status}`;
        return;
      }
      state.health = 'healthy';
      state.lastSuccessAt = new Date().toISOString();
      state.cooldownUntil = undefined;
      state.lastError = undefined;
    } catch (error) {
      state.health = 'failed';
      state.lastError =
        error instanceof Error ? error.message : 'Provider validation failed';
    }
  }

  private emptyHealth() {
    return { health: 'unknown' as const, usageCount: 0 };
  }

  private async save(userId: string, settings: IntegrationSettings) {
    await this.repository.upsert(
      {
        key: SETTINGS_KEY,
        encryptedValue: this.encrypt(JSON.stringify(settings)),
        valueType: 'json',
        active: settings.active,
        updatedBy: userId,
      },
      ['key'],
    );
  }

  private encryptionKey() {
    const raw = this.configService.get<string>('CONFIG_ENCRYPTION_KEY');
    if (!raw)
      throw new InternalServerErrorException(
        'CONFIG_ENCRYPTION_KEY is not configured',
      );
    return createHash('sha256').update(raw).digest();
  }

  private encrypt(value: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey(), iv);
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
      'base64',
    );
  }

  private decrypt(value: string) {
    const buffer = Buffer.from(value, 'base64');
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey(),
      buffer.subarray(0, 12),
    );
    decipher.setAuthTag(buffer.subarray(12, 28));
    return Buffer.concat([
      decipher.update(buffer.subarray(28)),
      decipher.final(),
    ]).toString('utf8');
  }

  private mask(value: string) {
    if (value.length <= 8) return '********';
    return `${value.slice(0, 4)}${MASK_MARKER}${value.slice(-4)}`;
  }
}
