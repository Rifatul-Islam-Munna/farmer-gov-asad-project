import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingModule } from '../listings/listing.module';
import { UserModule } from '../user/user.module';
import { DealController } from './deal.controller';
import { Deal, Offer } from './entities/deal.entity';
import { DealService } from './deal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Offer, Deal]), ListingModule, UserModule],
  controllers: [DealController],
  providers: [DealService],
  exports: [DealService, TypeOrmModule],
})
export class DealModule {}
