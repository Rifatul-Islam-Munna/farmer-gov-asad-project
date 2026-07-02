import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DEAL_MODEL, DealSchema } from '../deals/deal.entity';
import { LISTING_MODEL, ListingSchema } from '../listings/listing.entity';
import { REPORT_MODEL, ReportSchema } from '../reports/report.entity';
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
      { name: LISTING_MODEL, schema: ListingSchema },
      { name: DEAL_MODEL, schema: DealSchema },
      { name: REPORT_MODEL, schema: ReportSchema },
    ]),
    UserModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}