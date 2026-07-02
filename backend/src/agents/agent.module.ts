import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListingModule } from '../listings/listing.module';
import { USER_MODEL, UserSchema } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { AgentActionSchema, AGENT_ACTION_MODEL } from './agent-action.entity';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AGENT_ACTION_MODEL, schema: AgentActionSchema },
      { name: USER_MODEL, schema: UserSchema },
    ]),
    UserModule,
    ListingModule,
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
