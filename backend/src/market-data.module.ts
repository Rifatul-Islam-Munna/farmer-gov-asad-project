import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketPriceController } from './market-price/market-price.controller';
import { MarketDataService } from './market-price/market-data.service';
import {
  MARKET_PRICE_MODEL,
  MarketPriceSchema,
} from './market-price/market-price.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MARKET_PRICE_MODEL, schema: MarketPriceSchema },
    ]),
    UserModule,
  ],
  controllers: [MarketPriceController],
  providers: [MarketDataService],
  exports: [MarketDataService],
})
export class MarketDataModule {}
