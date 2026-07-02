import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { ReportController } from './report.controller';
import { REPORT_MODEL, ReportSchema } from './report.entity';
import { ReportService } from './report.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: REPORT_MODEL, schema: ReportSchema }]),
    UserModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
