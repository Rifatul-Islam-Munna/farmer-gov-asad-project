import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateReportDto, ReportQueryDto, UpdateReportDto } from './report.dto';
import {
  REPORT_MODEL,
  Report,
  ReportStatus,
} from './report.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(REPORT_MODEL)
    private readonly reportModel: Model<Report>,
  ) {}

  async create(reporterId: string, dto: CreateReportDto) {
    const data = await this.reportModel.create({
      reporterId,
      ...dto,
      subject: dto.subject.trim(),
      description: dto.description.trim(),
      status: ReportStatus.OPEN,
    });
    return { data: data.toObject() };
  }

  async mine(reporterId: string) {
    const data = await this.reportModel
      .find({ reporterId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return { data };
  }

  async list(query: ReportQueryDto) {
    const filter: FilterQuery<Report> = {};
    if (query.status) filter.status = query.status;
    if (query.targetType) filter.targetType = query.targetType;
    if (query.search?.trim()) {
      const search = new RegExp(this.escapeRegex(query.search.trim()), 'i');
      filter.$or = [
        { subject: search },
        { description: search },
        { targetId: search },
        { reporterId: search },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await Promise.all([
      this.reportModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.reportModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async update(id: string, adminId: string, dto: UpdateReportDto) {
    const resolved = [ReportStatus.RESOLVED, ReportStatus.REJECTED].includes(
      dto.status,
    );
    const data = await this.reportModel
      .findByIdAndUpdate(
        id,
        {
          status: dto.status,
          adminNote: dto.adminNote?.trim(),
          resolvedBy: resolved ? adminId : undefined,
          resolvedAt: resolved ? new Date() : undefined,
        },
        { returnDocument: 'after' },
      )
      .lean();

    if (!data) {
      throw new NotFoundException('Report not found');
    }
    return { data };
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}