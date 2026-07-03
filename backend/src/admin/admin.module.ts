import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DEAL_MODEL, DealSchema, OFFER_MODEL, OfferSchema } from '../deals/deal.entity';
import {
  GOOD_MODEL,
  GoodSchema,
  GOODS_CATEGORY_MODEL,
  GoodsCategorySchema,
} from '../goods/good.entity';
import { LISTING_MODEL, ListingSchema } from '../listings/listing.entity';
import {
  MARKET_PRICE_MODEL,
  MarketPriceSchema,
} from '../market-price/market-price.entity';
import {
  SELLER_INVENTORY_MODEL,
  SellerInventorySchema,
} from '../medicine-sellers/medicine.entity';
import { USER_MODEL, UserSchema } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { GUIDANCE_MODEL, GuidanceSchema } from './admin-content.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: USER_MODEL, schema: UserSchema },
      { name: GUIDANCE_MODEL, schema: GuidanceSchema },
      { name: GOOD_MODEL, schema: GoodSchema },
      { name: GOODS_CATEGORY_MODEL, schema: GoodsCategorySchema },
      { name: MARKET_PRICE_MODEL, schema: MarketPriceSchema },
      { name: LISTING_MODEL, schema: ListingSchema },
      { name: OFFER_MODEL, schema: OfferSchema },
      { name: DEAL_MODEL, schema: DealSchema },
      { name: SELLER_INVENTORY_MODEL, schema: SellerInventorySchema },
    ]),
    UserModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
