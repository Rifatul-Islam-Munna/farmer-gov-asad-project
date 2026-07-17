import { Module } from '@nestjs/common';
import { DetectionModule } from './detection/detection.module';
import { DocumentModule } from './documents/document.module';

@Module({
  imports: [DocumentModule, DetectionModule],
})
export class SupportModule {}
