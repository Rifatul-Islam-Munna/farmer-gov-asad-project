import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../../user/user.module';
import { ObjectDeletionOutbox } from './entities/object-deletion-outbox.entity';
import { MinioService } from './minio.service';
import { ObjectDeletionOutboxService } from './object-deletion-outbox.service';
import { StorageController } from './storage.controller';

@Global()
@Module({
  imports: [UserModule, TypeOrmModule.forFeature([ObjectDeletionOutbox])],
  controllers: [StorageController],
  providers: [MinioService, ObjectDeletionOutboxService],
  exports: [MinioService, ObjectDeletionOutboxService],
})
export class StorageModule {}
