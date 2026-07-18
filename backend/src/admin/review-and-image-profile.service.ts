import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { AuditService } from '../audit/audit.service';
import { ResilientQueueService } from '../lib/queue/resilient-queue.service';
import { MinioService } from '../lib/storage/minio.service';
import { UserService } from '../user/user.service';
import {
  BulkRegisterImageProfileItemsDto,
  CreateImageProfileDto,
  ImageProfilePresignDto,
  ReviewProfessionalAccountDto,
  SubmitProfessionalReviewDto,
  UpdateImageProfileItemDto,
} from './dto/review-and-image-profile.dto';
import { ImageProfile } from './entities/image-profile.entity';
import { ProfessionalReview } from './entities/professional-review.entity';

@Injectable()
export class ReviewAndImageProfileService {
  constructor(
    @InjectRepository(ProfessionalReview)
    private readonly reviewRepository: Repository<ProfessionalReview>,
    @InjectRepository(ImageProfile)
    private readonly profileRepository: Repository<ImageProfile>,
    private readonly auditService: AuditService,
    private readonly userService: UserService,
    private readonly queueService: ResilientQueueService,
    private readonly minioService: MinioService,
  ) {}

  async submitProfessionalReview(
    userId: string,
    dto: SubmitProfessionalReviewDto,
  ) {
    let review = await this.reviewRepository.findOne({ where: { userId } });
    review = this.reviewRepository.create({
      ...(review ?? {}),
      userId,
      role: dto.role,
      documents: dto.documents.map((item) => ({
        ...item,
        status: 'pending' as const,
      })),
      checklist: dto.checklist,
      status: 'pending',
      reviewerId: null,
      reviewerNote: null,
      reviewedAt: null,
    });
    return { data: await this.reviewRepository.save(review) };
  }

  listProfessionalReviews() {
    return this.reviewRepository.find({ order: { createdAt: 'DESC' } });
  }

  async reviewProfessionalAccount(
    reviewerId: string,
    id: string,
    dto: ReviewProfessionalAccountDto,
  ) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Professional review not found');
    const before = {
      status: review.status,
      documents: review.documents,
      checklist: review.checklist,
    };
    if (dto.documentDecisions) {
      review.documents = review.documents.map((document) => {
        const decision = dto.documentDecisions?.[document.key];
        return decision ? { ...document, ...decision } : document;
      });
    }
    if (dto.checklist) review.checklist = dto.checklist;
    review.status = dto.status;
    review.reviewerNote = dto.reviewerNote;
    review.reviewerId = reviewerId;
    review.reviewedAt = new Date();
    const saved = await this.reviewRepository.save(review);
    if (dto.status === 'approved') {
      await this.userService.setVerificationStatus(
        reviewerId,
        review.userId,
        'approved',
      );
    } else if (dto.status === 'rejected') {
      await this.userService.setVerificationStatus(
        reviewerId,
        review.userId,
        'rejected',
      );
    }
    await this.auditService.record({
      actorUserId: reviewerId,
      action: 'professional-review.updated',
      entityType: 'professional-review',
      entityId: review.id,
      before,
      after: {
        status: saved.status,
        documents: saved.documents,
        checklist: saved.checklist,
      },
      metadata: { note: dto.reviewerNote ?? '' },
    });
    return { data: saved };
  }

  async createImageProfile(actorUserId: string, dto: CreateImageProfileDto) {
    const code = dto.code.trim().toLowerCase();
    if (await this.profileRepository.exists({ where: { code } })) {
      throw new ConflictException('Image profile code already exists');
    }
    const profile = await this.profileRepository.save(
      this.profileRepository.create({
        ...dto,
        code,
        createdBy: actorUserId,
        updatedBy: actorUserId,
      }),
    );
    return { data: profile };
  }

  listImageProfiles() {
    return this.profileRepository.find({ order: { createdAt: 'DESC' } });
  }

  async imageProfile(id: string) {
    const profile = await this.profileRepository.findOne({ where: { id } });
    if (!profile) throw new NotFoundException('Image profile not found');
    return { data: profile };
  }

  async presignProfileUpload(id: string, dto: ImageProfilePresignDto) {
    await this.imageProfile(id);
    const safeName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
    const objectKey = `image-profiles/${id}/${randomUUID()}-${safeName}`;
    return {
      data: {
        objectKey,
        uploadUrl: await this.minioService.getSignedUploadUrl(
          objectKey,
          dto.contentType,
          600,
        ),
        expiresInSeconds: 600,
      },
    };
  }

  async bulkRegisterItems(
    actorUserId: string,
    id: string,
    dto: BulkRegisterImageProfileItemsDto,
  ) {
    const profile = (await this.imageProfile(id)).data;
    const existingChecksums = new Set(
      profile.items.map((item) => item.checksum).filter(Boolean),
    );
    const batchChecksums = new Set<string>();
    const incoming = dto.items.map((item) => {
      const duplicate = Boolean(
        item.checksum &&
        (existingChecksums.has(item.checksum) ||
          batchChecksums.has(item.checksum)),
      );
      if (item.checksum) batchChecksums.add(item.checksum);
      return {
        id: randomUUID(),
        ...item,
        status: duplicate ? ('duplicate' as const) : ('pending' as const),
      };
    });
    profile.items = [...profile.items, ...incoming];
    profile.duplicateCount = profile.items.filter(
      (item) => item.status === 'duplicate',
    ).length;
    profile.readyCount = profile.items.filter(
      (item) => item.status === 'ready',
    ).length;
    profile.failedCount = profile.items.filter(
      (item) => item.status === 'failed',
    ).length;
    profile.status = 'processing';
    profile.updatedBy = actorUserId;
    await this.profileRepository.save(profile);
    await this.queueService.add(
      'media',
      'image-profile-process-batch',
      {
        imageProfileId: profile.id,
        itemIds: incoming
          .filter((item) => item.status === 'pending')
          .map((item) => item.id),
      },
      { jobId: `image-profile:${profile.id}:v${profile.version + 1}` },
    );
    return {
      data: profile,
      duplicateCount: incoming.filter((item) => item.status === 'duplicate')
        .length,
    };
  }

  async updateItem(
    actorUserId: string,
    profileId: string,
    itemId: string,
    dto: UpdateImageProfileItemDto,
  ) {
    const profile = (await this.imageProfile(profileId)).data;
    const index = profile.items.findIndex((item) => item.id === itemId);
    if (index < 0) throw new NotFoundException('Image profile item not found');
    profile.items[index] = { ...profile.items[index], ...dto };
    profile.readyCount = profile.items.filter(
      (item) => item.status === 'ready',
    ).length;
    profile.duplicateCount = profile.items.filter(
      (item) => item.status === 'duplicate',
    ).length;
    profile.failedCount = profile.items.filter(
      (item) => item.status === 'failed',
    ).length;
    profile.updatedBy = actorUserId;
    return { data: await this.profileRepository.save(profile) };
  }

  async changeImageProfileStatus(
    actorUserId: string,
    id: string,
    status: 'active' | 'archived',
  ) {
    const profile = (await this.imageProfile(id)).data;
    if (status === 'active' && profile.readyCount < 10) {
      throw new BadRequestException(
        'At least 10 ready images are required before activation',
      );
    }
    profile.status = status;
    profile.updatedBy = actorUserId;
    profile.version += 1;
    await this.auditService.record({
      actorUserId,
      action: `image-profile.${status}`,
      entityType: 'image-profile',
      entityId: profile.id,
      after: { status, version: profile.version },
    });
    return { data: await this.profileRepository.save(profile) };
  }

  async reindexImageProfile(actorUserId: string, id: string, force = false) {
    const profile = (await this.imageProfile(id)).data;
    profile.status = 'processing';
    profile.version += 1;
    profile.updatedBy = actorUserId;
    await this.profileRepository.save(profile);
    const job = await this.queueService.add(
      'ai',
      'image-profile-reindex',
      { imageProfileId: id, version: profile.version, force },
      { jobId: `image-profile-reindex:${id}:v${profile.version}` },
    );
    return { data: profile, job };
  }
}
