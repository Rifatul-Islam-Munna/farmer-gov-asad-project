import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard, AuthenticatedRequest } from '../auth/access-token.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { UserType } from '../user/entities/user.entity';
import { CommunicationsService } from './communications.service';
import { CreateAdvertisementDto, CreateSupportTicketDto, UpdateAdvertisementDto, UpdateGuidanceDto, UpdateSupportTicketDto } from './dto/communications.dto';

@ApiTags('Communications')
@Controller()
export class CommunicationsController {
  constructor(private readonly service: CommunicationsService) {}

  @Post('support/tickets') @ApiBearerAuth() @UseGuards(AccessTokenGuard)
  createTicket(@Req() req: AuthenticatedRequest, @Body() dto: CreateSupportTicketDto) { return this.service.createTicket(req.user?.id ?? null, dto); }

  @Get('admin/notices') @ApiBearerAuth() @Roles(UserType.ADMIN, UserType.SUPER_ADMIN) @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  notices() { return this.service.notices(); }
  @Patch('admin/notices/:id') @ApiBearerAuth() @Roles(UserType.ADMIN, UserType.SUPER_ADMIN) @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateNotice(@Param('id') id: string, @Body() dto: UpdateGuidanceDto) { return this.service.updateNotice(id, dto); }
  @Delete('admin/notices/:id') @ApiBearerAuth() @Roles(UserType.ADMIN, UserType.SUPER_ADMIN) @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  deleteNotice(@Param('id') id: string) { return this.service.removeNotice(id); }

  @Get('admin/advertisements') @ApiBearerAuth() @Roles(UserType.ADMIN, UserType.SUPER_ADMIN) @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  ads() { return this.service.advertisements(); }
  @Post('admin/advertisements') @ApiBearerAuth() @Roles(UserType.ADMIN, UserType.SUPER_ADMIN) @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  createAd(@Body() dto: CreateAdvertisementDto) { return this.service.createAdvertisement(dto); }
  @Patch('admin/advertisements/:id') @ApiBearerAuth() @Roles(UserType.ADMIN, UserType.SUPER_ADMIN) @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateAd(@Param('id') id: string, @Body() dto: UpdateAdvertisementDto) { return this.service.updateAdvertisement(id, dto); }
  @Delete('admin/advertisements/:id') @ApiBearerAuth() @Roles(UserType.ADMIN, UserType.SUPER_ADMIN) @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  deleteAd(@Param('id') id: string) { return this.service.removeAdvertisement(id); }

  @Get('admin/support/tickets') @ApiBearerAuth() @Roles(UserType.ADMIN, UserType.SUPER_ADMIN) @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  tickets() { return this.service.ticketQueue(); }
  @Patch('admin/support/tickets/:id') @ApiBearerAuth() @Roles(UserType.ADMIN, UserType.SUPER_ADMIN) @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  updateTicket(@Param('id') id: string, @Body() dto: UpdateSupportTicketDto) { return this.service.updateTicket(id, dto); }
}
