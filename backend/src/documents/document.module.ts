import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { DocumentController } from './document.controller';

@Module({
  imports: [UserModule],
  controllers: [DocumentController],
})
export class DocumentModule {}
