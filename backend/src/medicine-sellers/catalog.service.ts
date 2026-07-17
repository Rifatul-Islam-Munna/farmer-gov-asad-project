import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toApiEntity } from '../lib/database/base.entity';
import { UpsertMedicineDto } from './dto/medicine-catalog.dto';
import { Medicine } from './entities/medicine.entity';

@Injectable()
export class CatalogService implements OnModuleInit {
  constructor(
    @InjectRepository(Medicine)
    private readonly repository: Repository<Medicine>,
  ) {}

  async onModuleInit() {
    await this.repository.upsert(
      [
        {
          code: 'neem-oil',
          name: 'Neem Oil',
          type: 'pesticide' as const,
          active: true,
        },
        {
          code: 'imidacloprid',
          name: 'Imidacloprid',
          type: 'pesticide' as const,
          active: true,
        },
        {
          code: 'npk-20-20-20',
          name: 'NPK 20-20-20',
          type: 'fertilizer' as const,
          active: true,
        },
      ],
      ['code'],
    );
  }

  async list() {
    const data = await this.repository.find({
      where: { active: true },
      order: { name: 'ASC' },
    });
    return { data: data.map(toApiEntity) };
  }

  async upsert(dto: UpsertMedicineDto) {
    const code = dto.code.trim().toLowerCase();
    await this.repository.upsert({ ...dto, code, active: dto.active ?? true }, [
      'code',
    ]);
    const data = await this.repository.findOneByOrFail({ code });
    return { data: toApiEntity(data) };
  }
}
