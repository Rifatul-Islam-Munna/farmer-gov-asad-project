import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { UserType } from '../user/user.entity';
import { CreateMarketPriceDto } from './market-price.dto';
import { MarketPriceService } from './market-price.service';

@ApiTags('Market Prices')
@Controller('market-prices')
export class MarketPriceController {
  constructor(private readonly marketPriceService: MarketPriceService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Get latest market prices and daily trends' })
  latest() {
    return this.marketPriceService.latest();
  }

  @Get('history/:goodCode')
  @ApiOperation({ summary: 'Get recent price history for one good' })
  history(@Param('goodCode') goodCode: string) {
    return this.marketPriceService.history(goodCode);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  @ApiOperation({ summary: 'Create or update a daily market price' })
  create(@Body() dto: CreateMarketPriceDto) {
    return this.marketPriceService.create(dto);
  }
}
