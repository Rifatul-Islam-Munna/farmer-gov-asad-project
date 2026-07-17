import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingModule } from '../listings/listing.module';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { AgentAction } from './entities/agent-action.entity';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentAction, User]),
    UserModule,
    ListingModule,
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
