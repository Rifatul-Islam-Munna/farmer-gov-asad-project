import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { UserType } from '../user/entities/user.entity';
import { CatalogService } from './catalog.service';
import { UpsertMedicineDto } from './dto/medicine-catalog.dto';

@ApiTags('Medicine Catalog')
@Controller('medicines')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List active medicines and farm products' })
  list() {
    return this.catalogService.list();
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  @ApiOperation({ summary: 'Create or update a medicine catalog item' })
  upsert(@Body() dto: UpsertMedicineDto) {
    return this.catalogService.upsert(dto);
  }
}
