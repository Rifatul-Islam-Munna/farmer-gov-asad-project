import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceBillingController } from './marketplace-billing.controller';
import { MarketplaceCacheService } from './marketplace-cache.service';
import { MarketplacePaymentService } from './marketplace-payment.service';
import { MarketplaceLifecycleService } from './marketplace-lifecycle.service';
import { MarketplaceChatGateway } from './marketplace-chat.gateway';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceAiTask } from './entities/marketplace-ai-task.entity';
import {
  MarketplaceAuction,
  MarketplaceBid,
  MarketplaceBulkOffer,
  MarketplaceBulkRequest,
  MarketplaceCartItem,
  MarketplaceFavorite,
  MarketplaceMessage,
  MarketplaceOrder,
  MarketplacePayment,
  MarketplaceProduct,
  MarketplaceRefund,
  MarketplaceRentalBooking,
  MarketplaceReview,
  MarketplaceSavedSearch,
} from './entities/marketplace.entity';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      MarketplaceProduct,
      MarketplaceFavorite,
      MarketplaceSavedSearch,
      MarketplaceCartItem,
      MarketplaceOrder,
      MarketplacePayment,
      MarketplaceRefund,
      MarketplaceRentalBooking,
      MarketplaceBulkRequest,
      MarketplaceBulkOffer,
      MarketplaceAuction,
      MarketplaceBid,
      MarketplaceMessage,
      MarketplaceReview,
      MarketplaceAiTask,
    ]),
  ],
  controllers: [MarketplaceController, MarketplaceBillingController],
  providers: [
    MarketplaceService,
    MarketplaceCacheService,
    MarketplacePaymentService,
    MarketplaceLifecycleService,
    MarketplaceChatGateway,
  ],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
