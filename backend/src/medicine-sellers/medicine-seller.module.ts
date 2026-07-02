import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_MODEL, UserSchema } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import {
  MEDICINE_MODEL,
  MedicineSchema,
  SELLER_INVENTORY_MODEL,
  SellerInventorySchema,
} from './medicine.entity';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MEDICINE_MODEL, schema: MedicineSchema },
      { name: SELLER_INVENTORY_MODEL, schema: SellerInventorySchema },
      { name: USER_MODEL, schema: UserSchema },
    ]),
    UserModule,
  ],
  controllers: [CatalogController, SellerController],
  providers: [CatalogService, SellerService],
  exports: [CatalogService, SellerService],
})
export class MedicineSellerModule {}
