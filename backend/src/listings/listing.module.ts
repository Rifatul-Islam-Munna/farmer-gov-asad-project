import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { ListingController } from './listing.controller';
import { LISTING_MODEL, ListingSchema } from './listing.entity';
import { ListingOwnerGuard } from './listing-owner.guard';
import { ListingService } from './listing.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LISTING_MODEL, schema: ListingSchema },
    ]),
    UserModule,
  ],
  controllers: [ListingController],
  providers: [ListingService, ListingOwnerGuard],
  exports: [ListingService, MongooseModule],
})
export class ListingModule {}
