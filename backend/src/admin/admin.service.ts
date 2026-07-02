import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { USER_MODEL, User, UserType } from '../user/user.entity';
import { GUIDANCE_MODEL, Guidance } from './admin-content.entity';
import { CreateGuidanceDto, UpdateVerificationDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(USER_MODEL)
    private readonly userModel: Model<User>,
    @InjectModel(GUIDANCE_MODEL)
    private readonly guidanceModel: Model<Guidance>,
  ) {}

  async pendingUsers() {
    const data = await this.userModel
      .find({ verificationStatus: 'pending' })
      .select('-credentialHash -otpNumber')
      .sort({ createdAt: 1 })
      .lean();
    return { data };
  }

  async updateVerification(userId: string, dto: UpdateVerificationDto) {
    const data = await this.userModel
      .findOneAndUpdate(
        { _id: userId, role: { $ne: UserType.ADMIN } },
        { verificationStatus: dto.status },
        { returnDocument: 'after' },
      )
      .select('-credentialHash -otpNumber')
      .lean();
    if (!data) {
      throw new NotFoundException('User not found');
    }
    return { data };
  }

  async createGuidance(dto: CreateGuidanceDto) {
    const data = await this.guidanceModel.create({
      ...dto,
      title: dto.title.trim(),
      message: dto.message.trim(),
      active: dto.active ?? true,
      publishedAt: new Date(),
    });
    return { data: data.toObject() };
  }

  async guidance(role: string) {
    const data = await this.guidanceModel
      .find({
        active: true,
        targetRole: { $in: ['all', role] },
      })
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean();
    return { data };
  }
}
