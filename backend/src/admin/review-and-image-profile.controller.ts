import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AccessTokenGuard,
  AuthenticatedRequest,
} from '../auth/access-token.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { FeatureWorkersService } from '../lib/queue/feature-workers.service';
import { UserType } from '../user/entities/user.entity';
import {
  BulkRegisterImageProfileItemsDto,
  CreateImageProfileDto,
  ImageProfilePresignDto,
  QueueJobDto,
  ReviewProfessionalAccountDto,
  SubmitProfessionalReviewDto,
  UpdateImageProfileItemDto,
} from './dto/review-and-image-profile.dto';
import { ReviewAndImageProfileService } from './review-and-image-profile.service';

@ApiTags('Professional Reviews and Image Profiles')
@Controller()
export class ReviewAndImageProfileController {
  constructor(
    private readonly service: ReviewAndImageProfileService,
    private readonly workers: FeatureWorkersService,
  ) {}

  @Post('professional-reviews/me')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary:
      'Submit or replace the current professional-account review package',
  })
  submitReview(
    @Req() request: AuthenticatedRequest,
    @Body() dto: SubmitProfessionalReviewDto,
  ) {
    return this.service.submitProfessionalReview(request.user.id, dto);
  }

  @Get('admin/professional-reviews')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  listReviews() {
    return this.service.listProfessionalReviews();
  }

  @Patch('admin/professional-reviews/:id')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  reviewAccount(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ReviewProfessionalAccountDto,
  ) {
    return this.service.reviewProfessionalAccount(request.user.id, id, dto);
  }

  @Post('admin/image-profiles')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  createProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateImageProfileDto,
  ) {
    return this.service.createImageProfile(request.user.id, dto);
  }

  @Get('admin/image-profiles')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  listProfiles() {
    return this.service.listImageProfiles();
  }

  @Get('admin/image-profiles/:id')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  getProfile(@Param('id') id: string) {
    return this.service.imageProfile(id);
  }

  @Post('admin/image-profiles/:id/presign')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  presign(@Param('id') id: string, @Body() dto: ImageProfilePresignDto) {
    return this.service.presignProfileUpload(id, dto);
  }

  @Post('admin/image-profiles/:id/items/bulk')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  bulkRegister(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: BulkRegisterImageProfileItemsDto,
  ) {
    return this.service.bulkRegisterItems(request.user.id, id, dto);
  }

  @Patch('admin/image-profiles/:profileId/items/:itemId')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateItem(
    @Req() request: AuthenticatedRequest,
    @Param('profileId') profileId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateImageProfileItemDto,
  ) {
    return this.service.updateItem(request.user.id, profileId, itemId, dto);
  }

  @Post('admin/image-profiles/:id/activate')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  activate(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.changeImageProfileStatus(request.user.id, id, 'active');
  }

  @Post('admin/image-profiles/:id/archive')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  archive(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.changeImageProfileStatus(
      request.user.id,
      id,
      'archived',
    );
  }

  @Post('admin/image-profiles/:id/reindex')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  reindex(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: QueueJobDto,
  ) {
    return this.service.reindexImageProfile(
      request.user.id,
      id,
      dto.force ?? false,
    );
  }

  @Get('admin/workers/status')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  workerStatus() {
    return { data: this.workers.status() };
  }
}
