import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { CreateReportDto, ReportQueryDto, UpdateReportDto } from './report.dto';
import { ReportService } from './report.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('reports')
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard)
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportService.create(request.user.id, dto);
  }

  @Get('reports/mine')
  @UseGuards(AccessTokenGuard)
  mine(@Req() request: AuthenticatedRequest) {
    return this.reportService.mine(request.user.id);
  }

  @Get('admin/reports')
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  list(@Query() query: ReportQueryDto) {
    return this.reportService.list(query);
  }

  @Patch('admin/reports/:id')
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  update(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateReportDto,
  ) {
    return this.reportService.update(id, request.user.id, dto);
  }
}