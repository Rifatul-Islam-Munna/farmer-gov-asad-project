import { Global, Module } from '@nestjs/common';
import { OptionalInfrastructureService } from './optional-infrastructure.service';

@Global()
@Module({
  providers: [OptionalInfrastructureService],
  exports: [OptionalInfrastructureService],
})
export class InfrastructureModule {}
