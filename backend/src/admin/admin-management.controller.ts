import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AccessTokenGuard,
  AuthenticatedRequest,
} from '../auth/access-token.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { UserType } from '../user/user.entity';
import {
  AdminDealQueryDto,
  AdminListingQueryDto,
  AdminUserQueryDto,
  UpdateAdminUserDto,
  UpdateDealStatusDto,
  UpdateListingStatusDto,
} from './admin.dto';
import { AdminService } from './admin.service';

@ApiTags('Administration')
@ApiBearerAuth()
@Roles(UserType.ADMIN)
@UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
@Controller('admin')
export class AdminManagementController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get('users')
  users(@Query() query: AdminUserQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminService.updateUser(id, request.user.id, dto);
  }

  @Get('listings')
  listings(@Query() query: AdminListingQueryDto) {
    return this.adminService.listListings(query);
  }

  @Patch('listings/:id/status')
  updateListingStatus(
    @Param('id') id: string,
    @Body() dto: UpdateListingStatusDto,
  ) {
    return this.adminService.updateListingStatus(id, dto);
  }

  @Get('deals')
  deals(@Query() query: AdminDealQueryDto) {
    return this.adminService.listDeals(query);
  }

  @Patch('deals/:id/status')
  updateDealStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDealStatusDto,
  ) {
    return this.adminService.updateDealStatus(id, dto);
  }
}
