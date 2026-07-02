import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AccessTokenGuard,
  AuthenticatedRequest,
} from '../auth/access-token.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { UserType } from '../user/user.entity';
import { CreateListingDto, SearchListingsDto } from './listing.dto';
import { ListingOwnerGuard } from './listing-owner.guard';
import { ListingService } from './listing.service';

@ApiTags('Listings')
@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Get()
  @ApiOperation({ summary: 'Search published farmer listings' })
  search(@Query() query: SearchListingsDto) {
    return this.listingService.search(query);
  }

  @Get('mine')
  @ApiBearerAuth()
  @Roles(UserType.FARMER, UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  mine(@Req() request: AuthenticatedRequest) {
    return this.listingService.mine(request.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserType.FARMER, UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateListingDto,
  ) {
    return this.listingService.createForOwner(request.user.id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserType.FARMER, UserType.ADMIN)
  @UseGuards(
    AccessTokenGuard,
    VerifiedAccountGuard,
    RolesGuard,
    ListingOwnerGuard,
  )
  cancel(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.listingService.cancel(id, request.user.id, request.user.role);
  }
}
