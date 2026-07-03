import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { CreateGoodDto } from '../goods/good.dto';
import { CreateMarketPriceDto } from '../market-price/market-price.dto';
import { UserType } from '../user/user.entity';
import {
  AdminSearchDto,
  AdminUpdateDealDto,
  AdminUpdateInventoryDto,
  AdminUpdateListingDto,
  AdminUpdateUserDto,
  AdminUserSearchDto,
  CreateGuidanceDto,
  UpdateVerificationDto,
} from './admin.dto';
import { AdminService } from './admin.service';

@ApiTags('Administration')
@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('guidance')
  @ApiOperation({ summary: 'List active suggestions and notices for a role' })
  guidance(@Query('role') role = 'farmer') {
    return this.adminService.guidance(role);
  }

  @Get('admin/dashboard')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get('admin/users')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  users(@Query() query: AdminUserSearchDto) {
    return this.adminService.users(query);
  }

  @Get('admin/users/pending')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  pendingUsers() {
    return this.adminService.pendingUsers();
  }

  @Patch('admin/users/:id')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateUser(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Patch('admin/users/:id/verification')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateVerification(
    @Param('id') id: string,
    @Body() dto: UpdateVerificationDto,
  ) {
    return this.adminService.updateVerification(id, dto);
  }

  @Post('admin/guidance')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  createGuidance(@Body() dto: CreateGuidanceDto) {
    return this.adminService.createGuidance(dto);
  }

  @Get('admin/listings')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  listings(@Query() query: AdminSearchDto) {
    return this.adminService.listings(query);
  }

  @Patch('admin/listings/:id')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateListing(
    @Param('id') id: string,
    @Body() dto: AdminUpdateListingDto,
  ) {
    return this.adminService.updateListing(id, dto);
  }

  @Get('admin/deals')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  deals(@Query() query: AdminSearchDto) {
    return this.adminService.deals(query);
  }

  @Patch('admin/deals/:id')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateDeal(@Param('id') id: string, @Body() dto: AdminUpdateDealDto) {
    return this.adminService.updateDeal(id, dto);
  }

  @Get('admin/offers')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  offers(@Query() query: AdminSearchDto) {
    return this.adminService.offers(query);
  }

  @Get('admin/prices')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  prices() {
    return this.adminService.prices();
  }

  @Post('admin/prices')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  upsertPrice(@Body() dto: CreateMarketPriceDto) {
    return this.adminService.upsertPrice(dto);
  }

  @Get('admin/goods')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  goods() {
    return this.adminService.goods();
  }

  @Post('admin/goods')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  upsertGood(@Body() dto: CreateGoodDto) {
    return this.adminService.upsertGood(dto);
  }

  @Get('admin/inventory')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  inventory(@Query() query: AdminSearchDto) {
    return this.adminService.inventory(query);
  }

  @Patch('admin/inventory/:id')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateInventory(
    @Param('id') id: string,
    @Body() dto: AdminUpdateInventoryDto,
  ) {
    return this.adminService.updateInventory(id, dto);
  }
}
