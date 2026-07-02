import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ALERT_MODEL, Alert } from './alert.entity';

@Injectable()
export class AlertService {
  constructor(
    @InjectModel(ALERT_MODEL)
    private readonly alertModel: Model<Alert>,
  ) {}

  async create(
    userId: string,
    type: string,
    title: string,
    message: string,
    data: Record<string, unknown> = {},
  ) {
    return this.alertModel.create({ userId, type, title, message, data });
  }

  async createMany(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    data: Record<string, unknown> = {},
  ) {
    const uniqueIds = [...new Set(userIds.filter(Boolean))];
    if (uniqueIds.length === 0) return [];
    return this.alertModel.insertMany(
      uniqueIds.map((userId) => ({ userId, type, title, message, data })),
    );
  }

  async list(userId: string) {
    const data = await this.alertModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    const unreadCount = await this.alertModel.countDocuments({
      userId,
      readAt: { $exists: false },
    });
    return { data, unreadCount };
  }

  async markRead(userId: string, id: string) {
    const data = await this.alertModel.findOneAndUpdate(
      { _id: id, userId },
      { readAt: new Date() },
      { returnDocument: 'after' },
    );
    if (!data) {
      throw new NotFoundException('Alert not found');
    }
    return { data };
  }

  async markAllRead(userId: string) {
    await this.alertModel.updateMany(
      { userId, readAt: { $exists: false } },
      { readAt: new Date() },
    );
    return { message: 'All alerts marked as read' };
  }
}
