import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { toApiEntity } from '../lib/database/base.entity';
import { Alert } from './entities/alert.entity';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
  ) {}

  async create(
    userId: string,
    type: string,
    title: string,
    message: string,
    data: Record<string, unknown> = {},
  ) {
    const alert = await this.alertRepository.save(
      this.alertRepository.create({ userId, type, title, message, data }),
    );
    return toApiEntity(alert);
  }

  async createMany(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    data: Record<string, unknown> = {},
  ) {
    const uniqueIds = [...new Set(userIds.filter(Boolean))];
    if (!uniqueIds.length) return [];
    const records = await this.alertRepository.save(
      uniqueIds.map((userId) =>
        this.alertRepository.create({ userId, type, title, message, data }),
      ),
    );
    return records.map(toApiEntity);
  }

  async list(userId: string) {
    const [data, unreadCount] = await Promise.all([
      this.alertRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 100,
      }),
      this.alertRepository.count({ where: { userId, readAt: IsNull() } }),
    ]);
    return { data: data.map(toApiEntity), unreadCount };
  }

  async markRead(userId: string, id: string) {
    const alert = await this.alertRepository.findOne({ where: { id, userId } });
    if (!alert) throw new NotFoundException('Alert not found');
    alert.readAt = new Date();
    return { data: toApiEntity(await this.alertRepository.save(alert)) };
  }

  async markAllRead(userId: string) {
    await this.alertRepository.update(
      { userId, readAt: IsNull() },
      { readAt: new Date() },
    );
    return { message: 'All alerts marked as read' };
  }
}
