import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { toApiEntity } from '../lib/database/base.entity';
import {
  CreateGoodDto,
  CreateGoodsCategoryDto,
  SearchGoodsDto,
} from './dto/good.dto';
import { Good, GoodsCategory } from './entities/good.entity';

@Injectable()
export class GoodService implements OnModuleInit {
  constructor(
    @InjectRepository(GoodsCategory)
    private readonly categoryRepository: Repository<GoodsCategory>,
    @InjectRepository(Good)
    private readonly goodRepository: Repository<Good>,
  ) {}

  async onModuleInit() {
    const categories: Partial<GoodsCategory>[] = [
      { code: 'grain', name: 'Grains', icon: 'grain', active: true },
      { code: 'vegetable', name: 'Vegetables', icon: 'eco', active: true },
      { code: 'fruit', name: 'Fruits', icon: 'nutrition', active: true },
    ];
    const goods: Partial<Good>[] = [
      {
        code: 'rice',
        name: 'Rice',
        categoryCode: 'grain',
        defaultUnit: 'kg',
        active: true,
      },
      {
        code: 'potato',
        name: 'Potato',
        categoryCode: 'vegetable',
        defaultUnit: 'kg',
        active: true,
      },
      {
        code: 'tomato',
        name: 'Tomato',
        categoryCode: 'vegetable',
        defaultUnit: 'kg',
        active: true,
      },
      {
        code: 'onion',
        name: 'Onion',
        categoryCode: 'vegetable',
        defaultUnit: 'kg',
        active: true,
      },
    ];

    await this.categoryRepository.upsert(categories, ['code']);
    await this.goodRepository.upsert(goods, ['code']);
  }

  async createCategory(dto: CreateGoodsCategoryDto) {
    const code = dto.code.trim().toLowerCase();
    await this.categoryRepository.upsert(
      { ...dto, code, active: dto.active ?? true },
      ['code'],
    );
    const data = await this.categoryRepository.findOneByOrFail({ code });
    return { data: toApiEntity(data) };
  }

  async createGood(dto: CreateGoodDto) {
    const code = dto.code.trim().toLowerCase();
    await this.goodRepository.upsert(
      {
        ...dto,
        code,
        categoryCode: dto.categoryCode.trim().toLowerCase(),
        active: dto.active ?? true,
      },
      ['code'],
    );
    const data = await this.goodRepository.findOneByOrFail({ code });
    return { data: toApiEntity(data) };
  }

  async listCategories() {
    const data = await this.categoryRepository.find({
      where: { active: true },
      order: { name: 'ASC' },
    });
    return { data: data.map(toApiEntity) };
  }

  async searchGoods(query: SearchGoodsDto) {
    const qb = this.goodRepository
      .createQueryBuilder('good')
      .where('good.active = true')
      .orderBy('good.name', 'ASC');
    if (query.categoryCode?.trim()) {
      qb.andWhere('good.categoryCode = :categoryCode', {
        categoryCode: query.categoryCode.trim().toLowerCase(),
      });
    }
    if (query.search?.trim()) {
      qb.andWhere(
        '(good.name ILIKE :search OR good.localName ILIKE :search OR good.code ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }
    const data = await qb.getMany();
    return { data: data.map(toApiEntity) };
  }
}
