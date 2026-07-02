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
import { MarketDataService } from './market-data.service';
import { CreateMarketPriceDto } from './market-price.dto';

@ApiTags('Market Prices')
@Controller('market-prices')
export class MarketPriceController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Get latest market prices and daily trends' })
  latest() {
    return this.marketDataService.latest();
  }

  @Get('history/:goodCode')
  @ApiOperation({ summary: 'Get recent price history for one good' })
  history(@Param('goodCode') goodCode: string) {
    return this.marketDataService.history(goodCode);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserType.ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  @ApiOperation({ summary: 'Create or update a daily market price' })
  create(@Body() dto: CreateMarketPriceDto) {
    return this.marketDataService.create(dto);
  }
}
