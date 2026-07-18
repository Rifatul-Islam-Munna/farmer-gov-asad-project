import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export type AuditInput = {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

export type AuditSearch = {
  action?: string;
  entityType?: string;
  actorUserId?: string;
  entityId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  async record(input: AuditInput) {
    return this.repository.save(
      this.repository.create({
        actorUserId: input.actorUserId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: input.before ?? {},
        after: input.after ?? {},
        metadata: input.metadata ?? {},
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      }),
    );
  }

  async list(limit = 100) {
    return this.repository.find({
      order: { createdAt: 'DESC' },
      take: Math.min(Math.max(limit, 1), 500),
    });
  }

  async search(query: AuditSearch) {
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.min(Math.max(query.pageSize ?? 50, 1), 200);
    const builder = this.repository.createQueryBuilder('audit');

    if (query.action?.trim()) {
      builder.andWhere('audit.action ILIKE :action', {
        action: `%${query.action.trim()}%`,
      });
    }
    if (query.entityType?.trim()) {
      builder.andWhere('audit.entityType = :entityType', {
        entityType: query.entityType.trim(),
      });
    }
    if (query.actorUserId?.trim()) {
      builder.andWhere('audit.actorUserId = :actorUserId', {
        actorUserId: query.actorUserId.trim(),
      });
    }
    if (query.entityId?.trim()) {
      builder.andWhere('audit.entityId = :entityId', {
        entityId: query.entityId.trim(),
      });
    }
    if (query.from) {
      builder.andWhere('audit.createdAt >= :from', {
        from: new Date(query.from),
      });
    }
    if (query.to) {
      builder.andWhere('audit.createdAt <= :to', {
        to: new Date(query.to),
      });
    }

    builder
      .orderBy('audit.createdAt', 'DESC')
      .addOrderBy('audit.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, total] = await builder.getManyAndCount();
    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        hasNextPage: page * pageSize < total,
      },
    };
  }

  async exportCsv(query: Omit<AuditSearch, 'page' | 'pageSize'>) {
    const result = await this.search({ ...query, page: 1, pageSize: 200 });
    const header = [
      'id',
      'createdAt',
      'actorUserId',
      'action',
      'entityType',
      'entityId',
      'before',
      'after',
      'metadata',
    ];
    const rows = result.data.map((item) =>
      [
        item.id,
        item.createdAt.toISOString(),
        item.actorUserId ?? '',
        item.action,
        item.entityType,
        item.entityId ?? '',
        JSON.stringify(item.before),
        JSON.stringify(item.after),
        JSON.stringify(item.metadata),
      ]
        .map((value) => this.csv(value))
        .join(','),
    );
    return [header.join(','), ...rows].join('\n');
  }

  private csv(value: unknown) {
    const text =
      value == null
        ? ''
        : typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean'
          ? `${value}`
          : JSON.stringify(value);
    return `"${text.replaceAll('"', '""')}"`;
  }
}
