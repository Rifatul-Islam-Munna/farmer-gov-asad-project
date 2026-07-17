import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { toApiEntity } from '../lib/database/base.entity';
import { CreateMarketPriceDto } from './dto/market-price.dto';
import { MarketPrice } from './entities/market-price.entity';

@Injectable()
export class MarketDataService implements OnModuleInit {
  constructor(
    @InjectRepository(MarketPrice)
    private readonly priceRepository: Repository<MarketPrice>,
  ) {}

  async onModuleInit() {
    const priceDate = this.dateOnly(new Date());
    const demo: CreateMarketPriceDto[] = [
      this.demo('rice', 'Rice', 52, 54, 53),
      this.demo('potato', 'Potato', 36, 38, 39),
      this.demo('tomato', 'Tomato', 68, 72, 69),
      this.demo('onion', 'Onion', 60, 63, 63),
    ];
    await this.priceRepository.upsert(
      demo.map((item) => ({ ...item, priceDate })),
      ['goodCode', 'region', 'priceDate'],
    );
  }

  async create(dto: CreateMarketPriceDto) {
    const goodCode = dto.goodCode.trim().toLowerCase();
    const region = dto.region.trim();
    const priceDate = this.dateOnly(
      dto.priceDate ? new Date(dto.priceDate) : new Date(),
    );
    await this.priceRepository.upsert({ ...dto, goodCode, region, priceDate }, [
      'goodCode',
      'region',
      'priceDate',
    ]);
    const data = await this.priceRepository.findOneByOrFail({
      goodCode,
      region,
      priceDate,
    });
    return { data: this.view(data) };
  }

  async latest() {
    const data = await this.priceRepository
      .createQueryBuilder('price')
      .distinctOn(['price.goodCode', 'price.region'])
      .orderBy('price.goodCode', 'ASC')
      .addOrderBy('price.region', 'ASC')
      .addOrderBy('price.priceDate', 'DESC')
      .getMany();
    return { data: data.map((item) => this.view(item)) };
  }

  async history(goodCode: string) {
    const data = await this.priceRepository.find({
      where: { goodCode: goodCode.trim().toLowerCase() },
      order: { priceDate: 'DESC' },
      take: 30,
    });
    return { data: data.map((item) => this.view(item)) };
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

  private view(record: MarketPrice) {
    const difference = record.marketPrice - record.previousMarketPrice;
    const percentageChange =
      record.previousMarketPrice === 0
        ? 0
        : (difference / record.previousMarketPrice) * 100;
    return {
      ...toApiEntity(record),
      difference: Number(difference.toFixed(2)),
      percentageChange: Number(percentageChange.toFixed(2)),
      trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable',
    };
  }

  private dateOnly(value: Date) {
    return value.toISOString().slice(0, 10);
  }
}
