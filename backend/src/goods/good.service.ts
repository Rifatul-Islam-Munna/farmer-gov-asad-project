import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  CreateGoodDto,
  CreateGoodsCategoryDto,
  SearchGoodsDto,
} from './good.dto';
import {
  GOOD_MODEL,
  GOODS_CATEGORY_MODEL,
  Good,
  GoodsCategory,
} from './good.entity';

@Injectable()
export class GoodService implements OnModuleInit {
  constructor(
    @InjectModel(GOODS_CATEGORY_MODEL)
    private readonly categoryModel: Model<GoodsCategory>,
    @InjectModel(GOOD_MODEL)
    private readonly goodModel: Model<Good>,
  ) {}

  async onModuleInit() {
    const categories = [
      { code: 'grain', name: 'Grains', icon: 'grain', active: true },
      { code: 'vegetable', name: 'Vegetables', icon: 'eco', active: true },
      { code: 'fruit', name: 'Fruits', icon: 'nutrition', active: true },
    ];
    const goods = [
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

    await Promise.all(
      categories.map((item) =>
        this.categoryModel.updateOne(
          { code: item.code },
          { $setOnInsert: item },
          { upsert: true },
        ),
      ),
    );
    await Promise.all(
      goods.map((item) =>
        this.goodModel.updateOne(
          { code: item.code },
          { $setOnInsert: item },
          { upsert: true },
        ),
      ),
    );
  }

  async createCategory(dto: CreateGoodsCategoryDto) {
    const data = await this.categoryModel.findOneAndUpdate(
      { code: dto.code.trim().toLowerCase() },
      {
        ...dto,
        code: dto.code.trim().toLowerCase(),
        active: dto.active ?? true,
      },
      { upsert: true, returnDocument: 'after' },
    );
    return { data };
  }

  async createGood(dto: CreateGoodDto) {
    const data = await this.goodModel.findOneAndUpdate(
      { code: dto.code.trim().toLowerCase() },
      {
        ...dto,
        code: dto.code.trim().toLowerCase(),
        categoryCode: dto.categoryCode.trim().toLowerCase(),
        active: dto.active ?? true,
      },
      { upsert: true, returnDocument: 'after' },
    );
    return { data };
  }

  async listCategories() {
    const data = await this.categoryModel
      .find({ active: true })
      .sort({ name: 1 })
      .lean();
    return { data };
  }

  async searchGoods(query: SearchGoodsDto) {
    const filter: FilterQuery<Good> = { active: true };
    if (query.categoryCode?.trim()) {
      filter.categoryCode = query.categoryCode.trim().toLowerCase();
    }
    if (query.search?.trim()) {
      filter.$text = { $search: query.search.trim() };
    }
    const data = await this.goodModel
      .find(filter)
      .sort({ name: 1 })
      .lean();
    return { data };
  }
}
