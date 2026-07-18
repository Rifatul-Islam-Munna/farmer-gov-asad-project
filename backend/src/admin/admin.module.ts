import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal, Offer } from '../deals/entities/deal.entity';
import { Good, GoodsCategory } from '../goods/entities/good.entity';
import { Listing } from '../listings/entities/listing.entity';
import { MarketPrice } from '../market-price/entities/market-price.entity';
import { SellerInventory } from '../medicine-sellers/entities/medicine.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { Guidance } from './entities/admin-content.entity';
import { IntegrationSetting } from './entities/integration-setting.entity';
import { ProfessionalReview } from './entities/professional-review.entity';
import { ImageProfile } from './entities/image-profile.entity';
import { Advertisement, SupportTicket } from './entities/communications.entity';
import { CommunicationsService } from './communications.service';
import { CommunicationsController } from './communications.controller';
import { ReviewAndImageProfileService } from './review-and-image-profile.service';
import { IntegrationSettingsService } from './integration-settings.service';
import { AdminController } from './admin.controller';
import { ReviewAndImageProfileController } from './review-and-image-profile.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Guidance,
      Good,
      GoodsCategory,
      MarketPrice,
      Listing,
      Offer,
      Deal,
      SellerInventory,
      IntegrationSetting,
      ProfessionalReview,
      ImageProfile,
      Advertisement,
      SupportTicket,
    ]),
    UserModule,
  ],
  controllers: [AdminController, ReviewAndImageProfileController, CommunicationsController],
  providers: [
    AdminService,
    IntegrationSettingsService,
    ReviewAndImageProfileService,
    CommunicationsService,
  ],
  exports: [AdminService],
})
export class AdminModule {}

