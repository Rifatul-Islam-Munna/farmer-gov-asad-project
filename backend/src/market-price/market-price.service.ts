import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMarketPriceDto } from './market-price.dto';
import { MARKET_PRICE_MODEL, MarketPrice } from './market-price.entity';

@Injectable()
export class MarketPriceService implements OnModuleInit {
  constructor(
    @InjectModel(MARKET_PRICE_MODEL)
    private readonly marketPriceModel: Model<MarketPrice>,
  ) {}

  async onModuleInit() {
    const priceDate = this.normalizeDate(new Date());
    const demoPrices: CreateMarketPriceDto[] = [
      {
        goodCode: 'rice',
        goodName: 'Rice',
        unit: 'kg',
        governmentPrice: 52,
        marketPrice: 54,
        previousMarketPrice: 53,
        region: 'National',
        marketName: 'Government Reference Market',
      },
      {
        goodCode: 'potato',
        goodName: 'Potato',
        unit: 'kg',
        governmentPrice: 36,
        marketPrice: 38,
        previousMarketPrice: 39,
        region: 'National',
        marketName: 'Government Reference Market',
      },
      {
        goodCode: 'tomato',
        goodName: 'Tomato',
        unit: 'kg',
        governmentPrice: 68,
        marketPrice: 72,
        previousMarketPrice: 69,
        region: 'National',
        marketName: 'Government Reference Market',
      },
      {
        goodCode: 'onion',
        goodName: 'Onion',
        unit: 'kg',
        governmentPrice: 60,
        marketPrice: 63,
        previousMarketPrice: 63,
        region: 'National',
        marketName: 'Government Reference Market',
      },
    ];

    await Promise.all(
      demoPrices.map((item) =>
        this.marketPriceModel.updateOne(
          { goodCode: item.goodCode, priceDate },
          { $setOnInsert: { ...item, priceDate } },
          { upsert: true },
        ),
      ),
    );
  }

  async create(dto: CreateMarketPriceDto) {
    const priceDate = this.normalizeDate(
      dto.priceDate ? new Date(dto.priceDate) : new Date(),
    );
    const record = await this.marketPriceModel.findOneAndUpdate(
      { goodCode: dto.goodCode.trim().toLowerCase(), priceDate },
      {
        ...dto,
        goodCode: dto.goodCode.trim().toLowerCase(),
        priceDate,
      },
      { upsert: true, returnDocument: 'after' },
    );
    return { data: this.toView(record?.toObject() ?? {}) };
  }

  async latest() {
    const records = await this.marketPriceModel
      .find()
      .sort({ priceDate: -1, goodName: 1 })
      .lean();
    const latestByGood = new Map<string, Record<string, any>>();

    for (const record of records) {
      if (!latestByGood.has(record.goodCode)) {
        latestByGood.set(record.goodCode, record);
      }
    }

    return {
      data: Array.from(latestByGood.values()).map((record) =>
        this.toView(record),
      ),
    };
  }

  async history(goodCode: string) {
    const records = await this.marketPriceModel
      .find({ goodCode: goodCode.trim().toLowerCase() })
      .sort({ priceDate: -1 })
      .limit(30)
      .lean();
    return { data: records.map((record) => this.toView(record)) };
  }

  private toView(record: Record<string, any>) {
    const marketPrice = Number(record.marketPrice ?? 0);
    const previousMarketPrice = Number(record.previousMarketPrice ?? 0);
    const difference = marketPrice - previousMarketPrice;
    const percentageChange = previousMarketPrice === 0
      ? 0
      : (difference / previousMarketPrice) * 100;
    const trend = difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable';

    return {
      ...record,
      difference: Number(difference.toFixed(2)),
      percentageChange: Number(percentageChange.toFixed(2)),
      trend,
    };
  }

  private normalizeDate(value: Date) {
    return new Date(Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
    ));
  }
}
