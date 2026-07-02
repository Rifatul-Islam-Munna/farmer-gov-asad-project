import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpsertMedicineDto } from './medicine-catalog.dto';
import { MEDICINE_MODEL, Medicine } from './medicine.entity';

@Injectable()
export class CatalogService implements OnModuleInit {
  constructor(
    @InjectModel(MEDICINE_MODEL)
    private readonly model: Model<Medicine>,
  ) {}

  async onModuleInit() {
    const demo = [
      ['neem-oil', 'Neem Oil', 'pesticide'],
      ['imidacloprid', 'Imidacloprid', 'pesticide'],
      ['npk-20-20-20', 'NPK 20-20-20', 'fertilizer'],
    ] as const;

    await Promise.all(
      demo.map(([code, name, type]) =>
        this.model.updateOne(
          { code },
          { $setOnInsert: { code, name, type, active: true } },
          { upsert: true },
        ),
      ),
    );
  }

  async list() {
    return {
      data: await this.model.find({ active: true }).sort({ name: 1 }).lean(),
    };
  }

  async upsert(dto: UpsertMedicineDto) {
    const code = dto.code.trim().toLowerCase();
    const data = await this.model.findOneAndUpdate(
      { code },
      { ...dto, code, active: dto.active ?? true },
      { upsert: true, returnDocument: 'after' },
    );
    return { data };
  }
}
