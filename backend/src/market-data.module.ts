import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketPriceController } from './market-price/market-price.controller';
import {
  MARKET_PRICE_MODEL,
  MarketPriceSchema,
} from './market-price/market-price.entity';
import { MarketPriceService } from './market-price/market-price.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MARKET_PRICE_MODEL, schema: MarketPriceSchema },
    ]),
    UserModule,
  ],
  controllers: [MarketPriceController],
  providers: [MarketPriceService],
  exports: [MarketPriceService],
})
export class MarketDataModule {}
