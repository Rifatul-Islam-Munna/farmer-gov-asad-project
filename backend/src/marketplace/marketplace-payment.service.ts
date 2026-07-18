import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import { Repository } from 'typeorm';
import {
  MarketplaceOrder,
  MarketplacePayment,
  MarketplaceRefund,
} from './entities/marketplace.entity';

@Injectable()
export class MarketplacePaymentService {
  private readonly stripe?: Stripe;

  constructor(
    @InjectRepository(MarketplaceOrder)
    private readonly orders: Repository<MarketplaceOrder>,
    @InjectRepository(MarketplacePayment)
    private readonly payments: Repository<MarketplacePayment>,
    @InjectRepository(MarketplaceRefund)
    private readonly refunds: Repository<MarketplaceRefund>,
    private readonly config: ConfigService,
  ) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    if (secret) this.stripe = new Stripe(secret);
  }

  listPayments() {
    return this.payments.find({ order: { createdAt: 'DESC' } });
  }

  listRefunds() {
    return this.refunds.find({ order: { createdAt: 'DESC' } });
  }

  async createPayment(orderId: string, buyerId: string) {
    const order = await this.orders.findOne({
      where: { id: orderId, buyerId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === 'paid')
      throw new BadRequestException('Order is already paid');
    if (!this.stripe) throw new BadRequestException('Stripe is not configured');

    const intent = await this.stripe.paymentIntents.create(
      {
        amount: Math.round(order.total * 100),
        currency: order.currency.toLowerCase(),
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
        automatic_payment_methods: { enabled: true },
      },
      { idempotencyKey: `order:${order.id}` },
    );

    const payment = await this.payments.save(
      this.payments.create({
        orderId: order.id,
        provider: 'stripe',
        providerReference: intent.id,
        amount: order.total,
        currency: order.currency,
        status: 'pending',
        providerPayload: { clientSecretPresent: Boolean(intent.client_secret) },
      }),
    );
    order.paymentProvider = 'stripe';
    order.paymentReference = intent.id;
    order.paymentStatus = 'pending';
    await this.orders.save(order);
    return {
      paymentId: payment.id,
      provider: 'stripe',
      clientSecret: intent.client_secret,
    };
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string | undefined) {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!this.stripe || !secret || !signature)
      throw new BadRequestException('Stripe webhook is not configured');
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      secret,
    );
    if (
      ![
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'charge.refunded',
      ].includes(event.type)
    ) {
      return { received: true, ignored: true };
    }

    if (
      event.type === 'payment_intent.succeeded' ||
      event.type === 'payment_intent.payment_failed'
    ) {
      const intent = event.data.object;
      const payment = await this.payments.findOne({
        where: { providerReference: intent.id },
      });
      if (!payment) return { received: true, missingPayment: true };
      const order = await this.orders.findOneByOrFail({ id: payment.orderId });
      payment.status =
        event.type === 'payment_intent.succeeded' ? 'paid' : 'failed';
      payment.providerPayload = {
        eventId: event.id,
        paymentIntentStatus: intent.status,
      };
      if (payment.status === 'paid') payment.paidAt = new Date();
      order.paymentStatus = payment.status;
      if (payment.status === 'paid' && order.status === 'pending')
        order.status = 'confirmed';
      await this.payments.save(payment);
      await this.orders.save(order);
      return {
        received: true,
        orderId: order.id,
        paymentStatus: order.paymentStatus,
      };
    }

    const charge = event.data.object as Stripe.Charge;
    const paymentIntentReference =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : (charge.payment_intent?.id ?? '');
    const payment = await this.payments.findOne({
      where: { providerReference: paymentIntentReference },
    });
    if (payment) {
      payment.status =
        charge.amount_refunded >= charge.amount
          ? 'refunded'
          : 'partially_refunded';
      await this.payments.save(payment);
      const order = await this.orders.findOneByOrFail({ id: payment.orderId });
      order.paymentStatus = payment.status === 'refunded' ? 'refunded' : 'paid';
      await this.orders.save(order);
    }
    return { received: true };
  }

  async refund(orderId: string, amount: number, reason: string) {
    const order = await this.orders.findOneBy({ id: orderId });
    if (!order) throw new NotFoundException('Order not found');
    const payment = await this.payments.findOne({
      where: { orderId, status: 'paid' },
    });
    if (!payment || !this.stripe)
      throw new BadRequestException('A paid Stripe payment is required');
    if (amount <= 0 || amount > payment.amount)
      throw new BadRequestException('Invalid refund amount');
    const stripeRefund = await this.stripe.refunds.create(
      {
        payment_intent: payment.providerReference,
        amount: Math.round(amount * 100),
        metadata: { orderId, reason },
      },
      {
        idempotencyKey: `refund:${orderId}:${Math.round(amount * 100)}:${reason}`,
      },
    );
    const refund = await this.refunds.save(
      this.refunds.create({
        paymentId: payment.id,
        orderId,
        amount,
        status: stripeRefund.status === 'succeeded' ? 'succeeded' : 'pending',
        providerReference: stripeRefund.id,
        reason,
        providerPayload: { stripeStatus: stripeRefund.status },
      }),
    );
    if (refund.status === 'succeeded') {
      payment.status =
        amount >= payment.amount ? 'refunded' : 'partially_refunded';
      order.paymentStatus = payment.status === 'refunded' ? 'refunded' : 'paid';
      await this.payments.save(payment);
      await this.orders.save(order);
    }
    return refund;
  }
}
