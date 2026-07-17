import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { DealService } from './deal.service';
import {
  CreateNegotiationDto,
  UpdateNegotiationDto,
} from './dto/negotiation.dto';

@ApiTags('Offers and Deals')
@ApiBearerAuth()
@Controller()
@UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
export class DealController {
  constructor(private readonly dealService: DealService) {}

  @Post('offers')
  @Roles(UserType.BUYER)
  @ApiOperation({ summary: 'Submit an offer for a farmer listing' })
  createOffer(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateNegotiationDto,
  ) {
    return this.dealService.createOffer(request.user.id, dto);
  }

  @Patch('offers/:id/counter')
  @Roles(UserType.BUYER, UserType.FARMER, UserType.ADMIN)
  @ApiOperation({ summary: 'Counter an offer with a new quantity and price' })
  counter(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateNegotiationDto,
  ) {
    return this.dealService.counter(
      id,
      request.user.id,
      request.user.role,
      dto,
    );
  }

  @Patch('offers/:id/accept')
  @Roles(UserType.BUYER, UserType.FARMER, UserType.ADMIN)
  @ApiOperation({ summary: 'Accept current offer terms' })
  accept(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.dealService.accept(id, request.user.id, request.user.role);
  }

  @Patch('offers/:id/reject')
  @Roles(UserType.BUYER, UserType.FARMER, UserType.ADMIN)
  reject(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.dealService.reject(id, request.user.id, request.user.role);
  }

  @Get('offers/mine')
  @Roles(UserType.BUYER, UserType.FARMER, UserType.ADMIN)
  offers(@Req() request: AuthenticatedRequest) {
    return this.dealService.offersForUser(request.user.id, request.user.role);
  }

  @Get('deals/mine')
  @Roles(UserType.BUYER, UserType.FARMER, UserType.ADMIN)
  deals(@Req() request: AuthenticatedRequest) {
    return this.dealService.dealsForUser(request.user.id, request.user.role);
  }
}
