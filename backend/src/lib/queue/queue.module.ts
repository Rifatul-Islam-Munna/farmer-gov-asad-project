import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerJobRecord } from './entities/worker-job-record.entity';
import { FeatureWorkersService } from './feature-workers.service';
import { ResilientQueueService } from './resilient-queue.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([WorkerJobRecord])],
  providers: [ResilientQueueService, FeatureWorkersService],
  exports: [ResilientQueueService, FeatureWorkersService],
})
export class QueueModule {}
