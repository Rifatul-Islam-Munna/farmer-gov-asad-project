import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { ListingController } from './listing.controller';
import { Listing } from './entities/listing.entity';
import { ListingOwnerGuard } from './listing-owner.guard';
import { ListingService } from './listing.service';

@Module({
  imports: [TypeOrmModule.forFeature([Listing]), UserModule],
  controllers: [ListingController],
  providers: [ListingService, ListingOwnerGuard],
  exports: [ListingService, TypeOrmModule],
})
export class ListingModule {}
