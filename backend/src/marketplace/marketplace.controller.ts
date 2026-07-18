import {
  Body,
  Controller,
  Delete,
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
import { UserType } from '../user/entities/user.entity';
import {
  AppealDto,
  AuctionDto,
  BidDto,
  BulkOfferDto,
  BulkRequestDto,
  CartItemDto,
  CheckoutDto,
  CreateMarketplaceProductDto,
  MarketplaceSearchDto,
  ModerateProductDto,
  RentalBookingDto,
  ReviewDto,
  SavedSearchDto,
  VoiceSearchDto,
} from './dto/marketplace.dto';
import { MarketplaceService } from './marketplace.service';
import { OrderStatusDto } from './dto/order-status.dto';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  @Get('products') search(@Query() dto: MarketplaceSearchDto) {
    return this.service.search(dto);
  }
  @Get('products/:id') product(@Param('id') id: string) {
    return this.service.getProduct(id);
  }
  @Get('products/:id/reviews') productReviews(@Param('id') id: string) {
    return this.service.listProductReviews(id);
  }
  @Get('auctions') auctions() {
    return this.service.listAuctions();
  }
  @Post('voice-search') voice(@Body() dto: VoiceSearchDto) {
    return this.service.voiceSearch(dto);
  }
  @Get('recommendations') recommend(@Query('q') q = '') {
    return this.service.recommend(q);
  }
  @Get('bulk-requests') bulk() {
    return this.service.listBulk();
  }

  @Get('bulk-requests/:id')
  bulkDetails(@Param('id') id: string) {
    return this.service.bulkDetails(id);
  }

  @Post('bulk-requests/:id/offers')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  submitBulkOffer(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: BulkOfferDto,
  ) {
    return this.service.submitBulkOffer(req.user.id, id, dto);
  }

  @Post('bulk-requests/:id/offers/:offerId/select')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  selectBulkOffer(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('offerId') offerId: string,
  ) {
    return this.service.selectBulkOffer(req.user.id, id, offerId);
  }

  @Post('products')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateMarketplaceProductDto,
  ) {
    return this.service.createProduct(req.user.id, dto);
  }
  @Get('seller/products')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  sellerProducts(@Req() req: AuthenticatedRequest) {
    return this.service.listSellerProducts(req.user.id);
  }

  @Post('products/:id/appeal')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  appeal(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: AppealDto,
  ) {
    return this.service.appeal(req.user.id, id, dto);
  }
  @Post('products/:id/description-draft')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  description(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.descriptionDraft(id, req.user.id);
  }
  @Get('products/:id/price-guidance') price(@Param('id') id: string) {
    return this.service.priceGuidance(id);
  }
  @Post('products/:id/image-edit')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  imageEdit(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('imageUrl') imageUrl?: string,
  ) {
    return this.service.imageEditRequest(id, req.user.id, imageUrl);
  }

  @Get('seller/ai-tasks')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  aiTasks(
    @Req() req: AuthenticatedRequest,
    @Query('productId') productId?: string,
  ) {
    return this.service.listAiTasks(req.user.id, productId);
  }

  @Post('seller/ai-tasks/:id/review')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  reviewAiTask(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('decision') decision: 'apply' | 'reject',
  ) {
    return this.service.reviewAiTask(req.user.id, id, decision);
  }

  @Post('favorites')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  favorite(
    @Req() req: AuthenticatedRequest,
    @Body('productId') productId: string,
  ) {
    return this.service.toggleFavorite(req.user.id, productId);
  }
  @Get('favorites')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  favorites(@Req() req: AuthenticatedRequest) {
    return this.service.listFavorites(req.user.id);
  }
  @Post('saved-searches')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  saveSearch(@Req() req: AuthenticatedRequest, @Body() dto: SavedSearchDto) {
    return this.service.saveSearch(req.user.id, dto);
  }
  @Get('saved-searches')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  savedSearches(@Req() req: AuthenticatedRequest) {
    return this.service.listSearches(req.user.id);
  }

  @Delete('saved-searches/:id')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  deleteSavedSearch(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.service.deleteSavedSearch(req.user.id, id);
  }

  @Post('cart')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  cartPut(@Req() req: AuthenticatedRequest, @Body() dto: CartItemDto) {
    return this.service.putCart(req.user.id, dto);
  }
  @Get('cart')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  cart(@Req() req: AuthenticatedRequest) {
    return this.service.listCart(req.user.id);
  }
  @Delete('cart/:productId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  cartDelete(@Req() req: AuthenticatedRequest, @Param('productId') id: string) {
    return this.service.removeCart(req.user.id, id);
  }
  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  checkout(@Req() req: AuthenticatedRequest, @Body() dto: CheckoutDto) {
    return this.service.checkout(req.user.id, dto);
  }
  @Get('orders')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  orders(@Req() req: AuthenticatedRequest) {
    return this.service.listOrders(req.user.id);
  }
  @Patch('orders/:id/status')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  orderStatus(@Param('id') id: string, @Body() dto: OrderStatusDto) {
    return this.service.updateOrderStatus(id, dto.status, dto.trackingNumber);
  }

  @Post('rentals')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  rental(@Req() req: AuthenticatedRequest, @Body() dto: RentalBookingDto) {
    return this.service.bookRental(req.user.id, dto);
  }
  @Post('bulk-requests')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  bulkCreate(@Req() req: AuthenticatedRequest, @Body() dto: BulkRequestDto) {
    return this.service.createBulk(req.user.id, dto);
  }
  @Post('auctions')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  auction(@Req() req: AuthenticatedRequest, @Body() dto: AuctionDto) {
    return this.service.createAuction(req.user.id, dto);
  }
  @Post('auctions/:id/bids')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  bid(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: BidDto,
  ) {
    return this.service.bid(req.user.id, id, dto);
  }

  @Post('reviews')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  review(@Req() req: AuthenticatedRequest, @Body() dto: ReviewDto) {
    return this.service.review(req.user.id, dto);
  }

  @Get('admin/bulk-requests')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  adminBulkRequests() {
    return this.service.adminBulkRequests();
  }

  @Get('admin/products')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  adminProducts() {
    return this.service.adminProducts();
  }

  @Get('admin/orders')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  adminOrders() {
    return this.service.adminOrders();
  }

  @Get('admin/reviews')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  adminReviews() {
    return this.service.adminReviews();
  }

  @Patch('admin/reviews/:id')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  moderateReview(
    @Param('id') id: string,
    @Body('status') status: 'published' | 'hidden',
  ) {
    return this.service.moderateReview(id, status);
  }

  @Patch('admin/products/:id/moderate')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  moderate(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ModerateProductDto,
  ) {
    return this.service.moderate(req.user.id, id, dto);
  }
}
