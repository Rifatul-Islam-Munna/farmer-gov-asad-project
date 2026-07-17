import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { GoodController } from './good.controller';
import { Good, GoodsCategory } from './entities/good.entity';
import { GoodService } from './good.service';

@Module({
  imports: [TypeOrmModule.forFeature([GoodsCategory, Good]), UserModule],
  controllers: [GoodController],
  providers: [GoodService],
  exports: [GoodService, TypeOrmModule],
})
export class GoodModule {}
