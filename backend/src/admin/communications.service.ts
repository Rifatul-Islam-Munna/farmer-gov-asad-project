import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toApiEntity } from '../lib/database/base.entity';
import { Guidance } from './entities/admin-content.entity';
import { Advertisement, SupportTicket } from './entities/communications.entity';
import { CreateAdvertisementDto, CreateSupportTicketDto, UpdateAdvertisementDto, UpdateGuidanceDto, UpdateSupportTicketDto } from './dto/communications.dto';

@Injectable()
export class CommunicationsService {
  constructor(
    @InjectRepository(Guidance) private readonly guidance: Repository<Guidance>,
    @InjectRepository(Advertisement) private readonly ads: Repository<Advertisement>,
    @InjectRepository(SupportTicket) private readonly tickets: Repository<SupportTicket>,
  ) {}

  async notices() { return { data: (await this.guidance.find({ order: { createdAt: 'DESC' }, take: 500 })).map(toApiEntity) }; }
  async updateNotice(id: string, dto: UpdateGuidanceDto) {
    const item = await this.guidance.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Notice not found');
    Object.assign(item, dto, {
      ...(dto.publishAt !== undefined ? { publishAt: dto.publishAt ? new Date(dto.publishAt) : null } : {}),
      ...(dto.expiresAt !== undefined ? { expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null } : {}),
      ...(dto.status === 'published' ? { publishedAt: new Date(), active: true } : {}),
      ...(dto.status === 'draft' ? { active: false } : {}),
    });
    return { data: toApiEntity(await this.guidance.save(item)) };
  }
  async removeNotice(id: string) { const result = await this.guidance.softDelete(id); if (!result.affected) throw new NotFoundException('Notice not found'); return { data: { id } }; }

  async advertisements() { return { data: (await this.ads.find({ order: { createdAt: 'DESC' }, take: 500 })).map(toApiEntity) }; }
  async createAdvertisement(dto: CreateAdvertisementDto) {
    const item = this.ads.create({ ...dto, title: dto.title.trim(), description: dto.description?.trim() ?? '', active: dto.active ?? true, startsAt: dto.startsAt ? new Date(dto.startsAt) : null, endsAt: dto.endsAt ? new Date(dto.endsAt) : null });
    return { data: toApiEntity(await this.ads.save(item)) };
  }
  async updateAdvertisement(id: string, dto: UpdateAdvertisementDto) {
    const item = await this.ads.findOne({ where: { id } }); if (!item) throw new NotFoundException('Advertisement not found');
    Object.assign(item, dto, { ...(dto.startsAt !== undefined ? { startsAt: dto.startsAt ? new Date(dto.startsAt) : null } : {}), ...(dto.endsAt !== undefined ? { endsAt: dto.endsAt ? new Date(dto.endsAt) : null } : {}) });
    return { data: toApiEntity(await this.ads.save(item)) };
  }
  async removeAdvertisement(id: string) { const result = await this.ads.softDelete(id); if (!result.affected) throw new NotFoundException('Advertisement not found'); return { data: { id } }; }

  async createTicket(requesterId: string | null, dto: CreateSupportTicketDto) { const item = this.tickets.create({ ...dto, requesterId, priority: dto.priority ?? 'normal' }); return { data: toApiEntity(await this.tickets.save(item)) }; }
  async ticketQueue() { return { data: (await this.tickets.find({ order: { createdAt: 'ASC' }, take: 500 })).map(toApiEntity) }; }
  async updateTicket(id: string, dto: UpdateSupportTicketDto) { const item = await this.tickets.findOne({ where: { id } }); if (!item) throw new NotFoundException('Ticket not found'); Object.assign(item, dto); return { data: toApiEntity(await this.tickets.save(item)) }; }
}
