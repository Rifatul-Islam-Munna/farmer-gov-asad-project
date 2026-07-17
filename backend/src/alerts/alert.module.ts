import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './entities/alert.entity';
import { AlertService } from './alert.service';

@Module({
  imports: [TypeOrmModule.forFeature([Alert])],
  providers: [AlertService],
  exports: [AlertService, TypeOrmModule],
})
export class AlertModule {}
