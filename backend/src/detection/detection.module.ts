import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { DemoDetectionService } from './demo-detection.service';
import { DetectionController } from './detection.controller';

@Module({
  imports: [UserModule],
  controllers: [DetectionController],
  providers: [DemoDetectionService],
  exports: [DemoDetectionService],
})
export class DetectionModule {}
