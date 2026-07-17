import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/access-token.guard';
import type { AuthenticatedRequest } from '../auth/access-token.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { UserType } from '../user/entities/user.entity';
import {
  AgentCreateFarmerDto,
  AgentListingRequestDto,
  SearchFarmersDto,
  VerifyAgentActionDto,
} from './dto/agent.dto';
import { AgentService } from './agent.service';

@ApiTags('Agent Workflows')
@ApiBearerAuth()
@Controller('agents')
@Roles(UserType.AGENT)
@UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('farmer-requests')
  @ApiOperation({ summary: 'Request OTP to create a farmer account' })
  requestFarmer(
    @Req() request: AuthenticatedRequest,
    @Body() dto: AgentCreateFarmerDto,
  ) {
    return this.agentService.requestFarmerCreation(request.user.id, dto);
  }

  @Post('listing-requests')
  @ApiOperation({ summary: 'Request OTP to post for a farmer' })
  requestListing(
    @Req() request: AuthenticatedRequest,
    @Body() dto: AgentListingRequestDto,
  ) {
    return this.agentService.requestDelegatedListing(request.user.id, dto);
  }

  @Post('verify-action')
  @ApiOperation({ summary: 'Verify farmer OTP and complete an agent action' })
  verify(
    @Req() request: AuthenticatedRequest,
    @Body() dto: VerifyAgentActionDto,
  ) {
    return this.agentService.verify(request.user.id, dto);
  }

  @Get('farmers')
  searchFarmers(@Query() query: SearchFarmersDto) {
    return this.agentService.searchFarmers(query);
  }

  @Get('history')
  history(@Req() request: AuthenticatedRequest) {
    return this.agentService.history(request.user.id);
  }
}
