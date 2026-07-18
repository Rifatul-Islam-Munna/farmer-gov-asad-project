import { BadRequestException } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { MinioService } from './minio.service';

describe('StorageController', () => {
  const getSignedUploadUrl = jest
    .fn()
    .mockResolvedValue('https://example.test/upload');
  const detectMime = jest.fn();
  const uploadBuffer = jest
    .fn()
    .mockResolvedValue({ key: 'listing/user/file.webp' });
  const minio = {
    getSignedUploadUrl,
    detectMime,
    uploadBuffer,
  } as unknown as MinioService;
  const controller = new StorageController(minio);
  const request = { user: { id: 'user-1' } } as never;

  beforeEach(() => jest.clearAllMocks());

  it('creates a feature-scoped presigned upload', async () => {
    const result = await controller.presign(
      {
        feature: 'listing',
        fileName: 'crop photo.webp',
        contentType: 'image/webp',
        size: 1024,
      },
      request,
    );
    expect(result.key).toContain('listing/user-1/');
    expect(getSignedUploadUrl).toHaveBeenCalledWith(
      expect.stringContaining('listing/user-1/'),
      'image/webp',
      300,
    );
  });

  it('rejects uploads whose declared MIME differs from detected content', async () => {
    detectMime.mockResolvedValue({
      mime: 'image/png',
      ext: 'png',
    });
    await expect(
      controller.upload(
        'listing',
        {
          buffer: Buffer.from('png'),
          size: 3,
          mimetype: 'image/jpeg',
          originalname: 'crop.jpg',
        } as Express.Multer.File,
        request,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a feature MIME that is outside its policy', () => {
    expect(() =>
      controller.presign(
        {
          feature: 'profile',
          fileName: 'document.pdf',
          contentType: 'application/pdf',
          size: 1024,
        },
        request,
      ),
    ).toThrow(BadRequestException);
  });
});
