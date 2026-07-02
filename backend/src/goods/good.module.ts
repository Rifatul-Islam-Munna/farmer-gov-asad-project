import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { GoodController } from './good.controller';
import {
  GOOD_MODEL,
  GOODS_CATEGORY_MODEL,
  GoodSchema,
  GoodsCategorySchema,
} from './good.entity';
import { GoodService } from './good.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GOODS_CATEGORY_MODEL, schema: GoodsCategorySchema },
      { name: GOOD_MODEL, schema: GoodSchema },
    ]),
    UserModule,
  ],
  controllers: [GoodController],
  providers: [GoodService],
  exports: [GoodService],
})
export class GoodModule {}
