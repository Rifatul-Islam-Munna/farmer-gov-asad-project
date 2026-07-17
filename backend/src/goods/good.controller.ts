import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { UserType } from '../user/entities/user.entity';
import {
  CreateGoodDto,
  CreateGoodsCategoryDto,
  SearchGoodsDto,
} from './dto/good.dto';
import { GoodService } from './good.service';

@ApiTags('Goods')
@Controller('goods')
export class GoodController {
  constructor(private readonly goodService: GoodService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List active goods categories' })
  listCategories() {
    return this.goodService.listCategories();
  }

  @Get()
  @ApiOperation({ summary: 'Search active agricultural goods' })
  searchGoods(@Query() query: SearchGoodsDto) {
    return this.goodService.searchGoods(query);
  }

  @Post('categories')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  @ApiOperation({ summary: 'Create or update a goods category' })
  createCategory(@Body() dto: CreateGoodsCategoryDto) {
    return this.goodService.createCategory(dto);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  @ApiOperation({ summary: 'Create or update an agricultural good' })
  createGood(@Body() dto: CreateGoodDto) {
    return this.goodService.createGood(dto);
  }
}
