import { ConfigService } from '@nestjs/config';
import { MinioService } from './minio.service';

const enabled = process.env.TEST_MINIO_URL;
const describeMinio = enabled ? describe : describe.skip;

describeMinio('MinIO real integration', () => {
  it('uploads, reads and deletes an object', async () => {
    const config = new ConfigService({
      MINIO_URL: process.env.TEST_MINIO_URL,
      MINIO_ACCESS_KEY: process.env.TEST_MINIO_ACCESS_KEY,
      MINIO_SECRET_KEY: process.env.TEST_MINIO_SECRET_KEY,
      MINIO_BUCKET: process.env.TEST_MINIO_BUCKET ?? 'agrivision-test',
      MINIO_PUBLIC_BUCKET: 'false',
    });
    const service = new MinioService(config);
    await service.onModuleInit();

    const uploaded = await service.uploadBuffer(
      Buffer.from('minio-integration-test'),
      {
        prefix: 'integration',
        originalName: 'test.txt',
        contentType: 'text/plain',
      },
    );
    const readUrl = await service.getSignedReadUrl(uploaded.key, 60);
    const readResponse = await fetch(readUrl);
    expect(readResponse.status).toBe(200);
    expect(await readResponse.text()).toBe('minio-integration-test');

    await service.deleteObjects([uploaded.key]);
    const deletedResponse = await fetch(readUrl);
    expect(deletedResponse.status).toBe(404);
  }, 30_000);
});
