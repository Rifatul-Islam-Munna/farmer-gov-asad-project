import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { UserType } from '../user/user.entity';

const uploadDirectory = join(process.cwd(), 'uploads', 'documents');
if (!existsSync(uploadDirectory)) {
  mkdirSync(uploadDirectory, { recursive: true });
}

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentController {
  @Post('upload')
  @Roles(UserType.BUYER, UserType.AGENT, UserType.MEDICINE_SELLER)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDirectory,
        filename: (_request, file, callback) => {
          const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${suffix}${extname(file.originalname).toLowerCase()}`);
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
        callback(
          allowed.includes(file.mimetype)
            ? null
            : new BadRequestException('Only PDF, JPG, PNG, or WEBP is allowed'),
          allowed.includes(file.mimetype),
        );
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
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
