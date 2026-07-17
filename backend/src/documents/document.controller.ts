import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const uploadDirectory = join(process.cwd(), 'uploads', 'documents');
if (!existsSync(uploadDirectory)) {
  mkdirSync(uploadDirectory, { recursive: true });
}

@ApiTags('Documents')
@Controller('documents')
export class DocumentController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDirectory,
        filename: (_request, file, callback) => {
          const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(
            null,
            `${suffix}${extname(file.originalname).toLowerCase()}`,
          );
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        const allowed = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/webp',
        ];
        const valid = allowed.includes(file.mimetype);
        callback(
          valid
            ? null
            : new BadRequestException('Only PDF, JPG, PNG, or WEBP is allowed'),
          valid,
        );
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a validated registration document before account creation',
  })
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Document file is required');
    }
    return {
      message: 'Document uploaded successfully',
      data: {
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/documents/${file.filename}`,
      },
    };
  }
}
