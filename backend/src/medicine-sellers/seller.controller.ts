import {
  Body,
  Controller,
  Get,
  Patch,
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
import { UserType } from '../user/user.entity';
import {
  NearbySellerFilterDto,
  NearbySellerQueryDto,
  UpdateSellerLocationDto,
  UpsertInventoryDto,
} from './seller-inventory.dto';
import { SellerService } from './seller.service';

@ApiTags('Medicine Sellers')
@Controller('medicine-sellers')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get('nearby/mine')
  @ApiBearerAuth()
  @Roles(UserType.FARMER, UserType.BUYER, UserType.AGENT, UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  @ApiOperation({
    summary: 'Find nearby sellers using the saved location of the current user',
  })
  nearbyForCurrentUser(
    @Req() request: AuthenticatedRequest,
    @Query() query: NearbySellerFilterDto,
  ) {
    return this.sellerService.nearbyForUser(request.user.id, query);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby sellers with matching stock' })
  nearby(@Query() query: NearbySellerQueryDto) {
    return this.sellerService.nearby(query);
  }

  @Patch('location')
  @ApiBearerAuth()
  @Roles(UserType.MEDICINE_SELLER)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateLocation(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateSellerLocationDto,
  ) {
    return this.sellerService.updateLocation(request.user.id, dto);
  }

  @Post('inventory')
  @ApiBearerAuth()
  @Roles(UserType.MEDICINE_SELLER)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  upsertInventory(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpsertInventoryDto,
  ) {
    return this.sellerService.upsertInventory(request.user.id, dto);
  }

  @Get('inventory/mine')
  @ApiBearerAuth()
  @Roles(UserType.MEDICINE_SELLER)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  inventory(@Req() request: AuthenticatedRequest) {
    return this.sellerService.mine(request.user.id);
  }
}
