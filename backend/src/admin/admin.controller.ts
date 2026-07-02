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
import { UserType } from '../user/user.entity';
import { CreateGuidanceDto, UpdateVerificationDto } from './admin.dto';
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

  @Get('admin/users/pending')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  pendingUsers() {
    return this.adminService.pendingUsers();
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
}
