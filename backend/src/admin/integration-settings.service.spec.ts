import { ConfigService } from '@nestjs/config';
import { IntegrationSettingsService } from './integration-settings.service';

describe('IntegrationSettingsService', () => {
  let row: Record<string, unknown> | null = null;
  const repository = {
    findOne: jest.fn(() => Promise.resolve(row)),
    upsert: jest.fn((value: Record<string, unknown>) => {
      row = value;
      return Promise.resolve();
    }),
  };
  const service = new IntegrationSettingsService(
    repository as never,
    new ConfigService({ CONFIG_ENCRYPTION_KEY: 'test-encryption-key' }),
  );

  beforeEach(() => {
    row = null;
    jest.restoreAllMocks();
  });

  it('persists per-key enablement and priority while masking secrets', async () => {
    const result = await service.update('admin-1', {
      geminiApiKeys: [
        { key: 'gemini-secret-key-123', enabled: false, priority: 20 },
      ],
      active: true,
    });

    expect(result.data.geminiApiKeys[0]).toMatchObject({
      enabled: false,
      priority: 20,
      health: 'unknown',
      usageCount: 0,
    });
    expect(result.data.geminiApiKeys[0].key).toContain('****');
  });

  it('records successful provider health and usage after safe validation', async () => {
    const saved = await service.update('admin-1', {
      geminiApiKeys: [
        { key: 'gemini-secret-key-123', enabled: true, priority: 10 },
      ],
      active: true,
    });
    const keyId = saved.data.geminiApiKeys[0].id;
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));

    const result = await service.testProvider('admin-1', {
      provider: 'gemini',
      keyId,
    });

    expect(result.data.geminiApiKeys[0]).toMatchObject({
      health: 'healthy',
      usageCount: 1,
    });
    expect(result.data.geminiApiKeys[0].lastSuccessAt).toBeTruthy();
  });

  it('records quota state and cooldown after HTTP 429', async () => {
    const saved = await service.update('admin-1', {
      geminiApiKeys: [
        { key: 'gemini-secret-key-123', enabled: true, priority: 10 },
      ],
      active: true,
    });
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 429 }));

    const result = await service.testProvider('admin-1', {
      provider: 'gemini',
      keyId: saved.data.geminiApiKeys[0].id,
    });

    expect(result.data.geminiApiKeys[0]).toMatchObject({
      health: 'quota',
      usageCount: 1,
    });
    expect(result.data.geminiApiKeys[0].lastQuotaErrorAt).toBeTruthy();
    expect(result.data.geminiApiKeys[0].cooldownUntil).toBeTruthy();
  });
});
