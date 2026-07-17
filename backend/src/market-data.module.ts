import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDataService } from './market-price/market-data.service';
import { MarketPriceController } from './market-price/market-price.controller';
import { MarketPrice } from './market-price/entities/market-price.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([MarketPrice]), UserModule],
  controllers: [MarketPriceController],
  providers: [MarketDataService],
  exports: [MarketDataService, TypeOrmModule],
})
export class MarketDataModule {}
