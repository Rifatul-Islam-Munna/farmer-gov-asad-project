import {
  Body,
  Controller,
  Get,
  Header,
  Param,
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
import { CreateGoodDto } from '../goods/dto/good.dto';
import { CreateMarketPriceDto } from '../market-price/dto/market-price.dto';
import { AuditService } from '../audit/audit.service';
import { UserType } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import {
  AdminSearchDto,
  AdminUpdateAccountStatusDto,
  AdminUpdateRolesDto,
  AdminUpdateDealDto,
  AdminUpdateInventoryDto,
  AdminUpdateListingDto,
  AdminUpdateUserDto,
  AdminUserSearchDto,
  CreateGuidanceDto,
  UpdateVerificationDto,
} from './dto/admin.dto';
import { AdminService } from './admin.service';
import {
  TestProviderDto,
  UpdateIntegrationSettingsDto,
} from './dto/integration-setting.dto';
import { IntegrationSettingsService } from './integration-settings.service';
import { SupportImpersonationDto } from './dto/support-impersonation.dto';

@ApiTags('Administration')
@Controller()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly integrationSettingsService: IntegrationSettingsService,
    private readonly userService: UserService,
    private readonly auditService: AuditService,
  ) {}

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
  async updateUser(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const { role, verificationStatus, ...profile } = dto;
    if (Object.keys(profile).length) {
      await this.adminService.updateUser(id, profile);
    }
    if (role) {
      await this.userService.setRoles(request.user.id, id, [role]);
    }
    if (verificationStatus) {
      await this.userService.setVerificationStatus(
        request.user.id,
        id,
        verificationStatus,
      );
    }
    return this.userService.findProfile(id);
  }

  @Patch('admin/users/:id/verification')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateVerification(
    @Param('id') id: string,
    @Body() dto: UpdateVerificationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.userService.setVerificationStatus(
      request.user.id,
      id,
      dto.status,
    );
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
  updateListing(@Param('id') id: string, @Body() dto: AdminUpdateListingDto) {
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

  @Get('admin/integrations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get masked AI, weather and notification settings' })
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  integrations() {
    return this.integrationSettingsService.getMasked();
  }

  @Patch('admin/integrations')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update encrypted AI, Windy and OneSignal settings',
  })
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateIntegrations(
    @Body() dto: UpdateIntegrationSettingsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.integrationSettingsService.update(request.user.id, dto);
  }

  @Post('admin/integrations/test')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Safely validate a configured provider key server-side',
  })
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  testIntegration(
    @Body() dto: TestProviderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.integrationSettingsService.testProvider(request.user.id, dto);
  }

  @Patch('admin/users/:id/roles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Replace approved roles for a user' })
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateRoles(
    @Param('id') id: string,
    @Body() dto: AdminUpdateRolesDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.userService.setRoles(request.user.id, id, dto.roles);
  }

  @Patch('admin/users/:id/account-status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate, suspend or soft-delete a user account' })
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateAccountStatus(
    @Param('id') id: string,
    @Body() dto: AdminUpdateAccountStatusDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.userService.setAccountStatus(
      request.user.id,
      id,
      dto.status,
      dto.reason,
    );
  }

  @Post('admin/support/impersonate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Issue a short-lived, audited support-mode token' })
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  supportImpersonate(
    @Body() dto: SupportImpersonationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.userService.issueSupportModeToken(
      request.user.id,
      dto.targetUserId,
      dto.reason,
      {
        ipAddress: request.ip,
        userAgent: request.header('user-agent')?.slice(0, 255),
      },
    );
  }

  @Get('admin/audit-logs/export')
  @ApiBearerAuth()
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header(
    'Content-Disposition',
    'attachment; filename="agrivision-audit-logs.csv"',
  )
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  exportAuditLogs(
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('actorUserId') actorUserId?: string,
    @Query('entityId') entityId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.auditService.exportCsv({
      action,
      entityType,
      actorUserId,
      entityId,
      from,
      to,
    });
  }

  @Get('admin/audit-logs')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Filter and paginate security and administrative audit events',
  })
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  auditLogs(
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('actorUserId') actorUserId?: string,
    @Query('entityId') entityId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '50',
  ) {
    return this.auditService.search({
      action,
      entityType,
      actorUserId,
      entityId,
      from,
      to,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 50,
    });
  }
}
