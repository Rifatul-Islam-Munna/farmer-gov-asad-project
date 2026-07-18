import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import {
  MarketplaceAuction,
  MarketplaceOrder,
  MarketplaceProduct,
} from './entities/marketplace.entity';

@Injectable()
export class MarketplaceLifecycleService {
  private readonly logger = new Logger(MarketplaceLifecycleService.name);

  constructor(
    @InjectRepository(MarketplaceAuction)
    private readonly auctions: Repository<MarketplaceAuction>,
    @InjectRepository(MarketplaceProduct)
    private readonly products: Repository<MarketplaceProduct>,
    @InjectRepository(MarketplaceOrder)
    private readonly orders: Repository<MarketplaceOrder>,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async closeExpiredAuctions() {
    const expired = await this.auctions.find({
      where: [
        { status: 'scheduled', endsAt: LessThanOrEqual(new Date()) },
        { status: 'live', endsAt: LessThanOrEqual(new Date()) },
      ],
      take: 100,
    });
    for (const auction of expired) {
      auction.status = 'ended';
      await this.auctions.save(auction);
      if (!auction.highestBidderId) continue;
      if (auction.reservePrice && auction.highestBid < auction.reservePrice)
        continue;
      const product = await this.products.findOneBy({ id: auction.productId });
      if (!product) continue;
      const order = this.orders.create({
        orderNumber: `AUC-${Date.now()}-${auction.id.slice(0, 6).toUpperCase()}`,
        buyerId: auction.highestBidderId,
        items: [
          {
            productId: product.id,
            sellerId: product.sellerId,
            title: product.title,
            quantity: 1,
            unitPrice: auction.highestBid,
            subtotal: auction.highestBid,
          },
        ],
        subtotal: auction.highestBid,
        deliveryFee: 0,
        total: auction.highestBid,
        currency: product.currency,
        status: 'pending',
        paymentStatus: 'unpaid',
        deliveryAddress: {},
      });
      await this.orders.save(order);
      product.stock = Math.max(0, product.stock - 1);
      product.soldCount += 1;
      await this.products.save(product);
      this.logger.log(`Closed auction ${auction.id} into order ${order.id}`);
    }
    return { closed: expired.length };
  }
}
