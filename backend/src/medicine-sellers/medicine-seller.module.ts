import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { Medicine, SellerInventory } from './entities/medicine.entity';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicine, SellerInventory, User]),
    UserModule,
  ],
  controllers: [CatalogController, SellerController],
  providers: [CatalogService, SellerService],
  exports: [CatalogService, SellerService, TypeOrmModule],
})
export class MedicineSellerModule {}
