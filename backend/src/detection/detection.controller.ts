import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { UserType } from '../user/entities/user.entity';
import { DemoDetectionService } from './demo-detection.service';

const imageUpload = FileInterceptor('image', {
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    callback(
      allowed.includes(file.mimetype)
        ? null
        : new BadRequestException('Only JPG, PNG, or WEBP images are allowed'),
      allowed.includes(file.mimetype),
    );
  },
});

@ApiTags('Demo Detection')
@ApiBearerAuth()
@Controller()
@UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
export class DetectionController {
  constructor(private readonly detectionService: DemoDetectionService) {}

  @Post('diagnosis/analyze')
  @Roles(UserType.FARMER, UserType.AGENT)
  @UseInterceptors(imageUpload)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Analyze a crop image using the demo provider' })
  diagnose(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Crop image is required');
    }
    return { data: this.detectionService.diagnose() };
  }

  @Post('goods/detect')
  @Roles(UserType.FARMER, UserType.AGENT)
  @UseInterceptors(imageUpload)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Identify a good using the demo provider' })
  identifyGood(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Goods image is required');
    }
    return { data: this.detectionService.identifyGood() };
  }
}
