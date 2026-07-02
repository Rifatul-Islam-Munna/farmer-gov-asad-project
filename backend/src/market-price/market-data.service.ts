import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMarketPriceDto } from './market-price.dto';
import { MARKET_PRICE_MODEL, MarketPrice } from './market-price.entity';

@Injectable()
export class MarketDataService implements OnModuleInit {
  constructor(
    @InjectModel(MARKET_PRICE_MODEL)
    private readonly priceModel: Model<MarketPrice>,
  ) {}

  async onModuleInit() {
    const priceDate = this.dateOnly(new Date());
    const demo: CreateMarketPriceDto[] = [
      this.demo('rice', 'Rice', 52, 54, 53),
      this.demo('potato', 'Potato', 36, 38, 39),
      this.demo('tomato', 'Tomato', 68, 72, 69),
      this.demo('onion', 'Onion', 60, 63, 63),
    ];

    await Promise.all(
      demo.map((item) =>
        this.priceModel.updateOne(
          {
            goodCode: item.goodCode,
            region: item.region,
            priceDate,
          },
          { $setOnInsert: { ...item, priceDate } },
          { upsert: true },
        ),
      ),
    );
  }

  async create(dto: CreateMarketPriceDto) {
    const goodCode = dto.goodCode.trim().toLowerCase();
    const region = dto.region.trim();
    const priceDate = this.dateOnly(
      dto.priceDate ? new Date(dto.priceDate) : new Date(),
    );
    const data = await this.priceModel.findOneAndUpdate(
      { goodCode, region, priceDate },
      { ...dto, goodCode, region, priceDate },
      { upsert: true, returnDocument: 'after' },
    );
    return { data: this.view(data?.toObject() ?? {}) };
  }

  async latest() {
    const records = await this.priceModel
      .find()
      .sort({ priceDate: -1, goodName: 1 })
      .lean();
    const latest = new Map<string, Record<string, any>>();

    for (const record of records) {
      const key = `${record.goodCode}:${record.region}`;
      if (!latest.has(key)) {
        latest.set(key, record);
      }
    }

    return { data: [...latest.values()].map((item) => this.view(item)) };
  }

  async history(goodCode: string) {
    const records = await this.priceModel
      .find({ goodCode: goodCode.trim().toLowerCase() })
      .sort({ priceDate: -1 })
      .limit(30)
      .lean();
    return { data: records.map((item) => this.view(item)) };
  }

  private demo(
    goodCode: string,
    goodName: string,
    governmentPrice: number,
    marketPrice: number,
    previousMarketPrice: number,
  ): CreateMarketPriceDto {
    return {
      goodCode,
      goodName,
      unit: 'kg',
      governmentPrice,
      marketPrice,
      previousMarketPrice,
      region: 'National',
      marketName: 'Government Reference Market',
    };
  }

  private view(record: Record<string, any>) {
    const current = Number(record.marketPrice ?? 0);
    const previous = Number(record.previousMarketPrice ?? 0);
    const difference = current - previous;
    const percentageChange =
      previous === 0 ? 0 : (difference / previous) * 100;

    return {
      ...record,
      difference: Number(difference.toFixed(2)),
      percentageChange: Number(percentageChange.toFixed(2)),
      trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable',
    };
  }

  private dateOnly(value: Date) {
    return new Date(
      Date.UTC(
        value.getUTCFullYear(),
        value.getUTCMonth(),
        value.getUTCDate(),
      ),
    );
  }
}
