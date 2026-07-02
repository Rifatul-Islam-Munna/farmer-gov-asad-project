import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListingModule } from '../listings/listing.module';
import { UserModule } from '../user/user.module';
import { DealController } from './deal.controller';
import {
  DEAL_MODEL,
  DealSchema,
  OFFER_MODEL,
  OfferSchema,
} from './deal.entity';
import { DealService } from './deal.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OFFER_MODEL, schema: OfferSchema },
      { name: DEAL_MODEL, schema: DealSchema },
    ]),
    ListingModule,
    UserModule,
  ],
  controllers: [DealController],
  providers: [DealService],
  exports: [DealService],
})
export class DealModule {}
