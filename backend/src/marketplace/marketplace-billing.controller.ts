import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request, Response } from 'express';
import bwipjs from 'bwip-js';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import {
  AccessTokenGuard,
  AuthenticatedRequest,
} from '../auth/access-token.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserType } from '../user/entities/user.entity';
import { MarketplaceOrder } from './entities/marketplace.entity';
import { MarketplacePaymentService } from './marketplace-payment.service';
import { MarketplaceService } from './marketplace.service';

@ApiTags('Marketplace billing')
@Controller('billing')
export class MarketplaceBillingController {
  constructor(
    private readonly payments: MarketplacePaymentService,
    private readonly marketplace: MarketplaceService,
    private readonly config: ConfigService,
  ) {}

  @Get('admin/payments')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  adminPayments() {
    return this.payments.listPayments();
  }

  @Get('admin/refunds')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  adminRefunds() {
    return this.payments.listRefunds();
  }

  @Post('orders/:orderId/payment')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  createPayment(
    @Param('orderId') orderId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.payments.createPayment(orderId, req.user.id);
  }

  @Post('stripe/webhook')
  stripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature?: string,
  ) {
    return this.payments.handleStripeWebhook(req.body as Buffer, signature);
  }

  @Post('orders/:orderId/refunds')
  @ApiBearerAuth()
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  refund(
    @Param('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
  ) {
    return this.payments.refund(orderId, amount, reason);
  }

  @Get('orders/:orderId/invoice-link')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  async invoiceLink(
    @Param('orderId') orderId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.marketplace.findOrderForInvoice(
      orderId,
      req.user.id,
      req.user.roles,
    );
    const expiresAt = Date.now() + 5 * 60_000;
    const payload = Buffer.from(
      JSON.stringify({ orderId, expiresAt }),
      'utf8',
    ).toString('base64url');
    const signature = this.sign(payload);
    return {
      url: `${this.publicBaseUrl()}/billing/invoices/${encodeURIComponent(orderId)}?token=${payload}.${signature}`,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  @Get('invoices/:orderId')
  @Header('Content-Type', 'application/pdf')
  async signedInvoice(
    @Param('orderId') orderId: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    this.verifySignedInvoiceToken(token, orderId);
    const order = await this.marketplace.getOrderForSignedInvoice(orderId);
    await this.streamInvoice(order, res);
  }

  @Get('invoices/:orderId/verify')
  async verifyInvoice(
    @Param('orderId') orderId: string,
    @Query('code') code: string,
  ) {
    const order = await this.marketplace.getOrderForSignedInvoice(orderId);
    const expected = this.invoiceVerificationCode(order);
    const provided = Buffer.from(code || '');
    const expectedBuffer = Buffer.from(expected);
    const valid =
      provided.length === expectedBuffer.length &&
      timingSafeEqual(provided, expectedBuffer);
    if (!valid) throw new BadRequestException('Invoice verification failed');
    return {
      valid: true,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      currency: order.currency,
      createdAt: order.createdAt,
      verifiedAt: new Date().toISOString(),
    };
  }

  @Get('orders/:orderId/invoice')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Header('Content-Type', 'application/pdf')
  async invoice(
    @Param('orderId') orderId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const order = await this.marketplace.findOrderForInvoice(
      orderId,
      req.user.id,
      req.user.roles,
    );
    await this.streamInvoice(order, res);
  }

  private async streamInvoice(order: MarketplaceOrder, res: Response) {
    const verificationCode = this.invoiceVerificationCode(order);
    const verificationUrl = `${this.publicBaseUrl()}/billing/invoices/${encodeURIComponent(order.id)}/verify?code=${verificationCode}`;
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      type: 'png',
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
    });
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: `${order.orderNumber}-${verificationCode.slice(0, 12)}`,
      scale: 2,
      height: 12,
      includetext: true,
      textxalign: 'center',
    });

    res.setHeader(
      'Content-Disposition',
      `inline; filename="${order.orderNumber}.pdf"`,
    );
    res.setHeader('Cache-Control', 'private, no-store');
    const doc = new PDFDocument({ margin: 48, size: 'A4' });
    doc.pipe(res);

    doc.fontSize(20).text('AgriVision Marketplace Invoice');
    doc.moveDown();
    doc.fontSize(11).text(`Order: ${order.orderNumber}`);
    doc.text(`Status: ${order.status}`);
    doc.text(`Payment: ${order.paymentStatus}`);
    doc.text(`Created: ${order.createdAt.toISOString()}`);
    if (order.trackingNumber) doc.text(`Tracking: ${order.trackingNumber}`);

    doc.moveDown();
    doc.fontSize(12).text('Items', { underline: true });
    doc.moveDown(0.5);
    for (const item of order.items) {
      doc
        .fontSize(10)
        .text(
          `${item.title} x ${item.quantity} - ${item.subtotal.toFixed(2)} ${order.currency}`,
        );
    }

    doc.moveDown();
    doc
      .fontSize(11)
      .text(`Subtotal: ${order.subtotal.toFixed(2)} ${order.currency}`);
    doc.text(`Delivery: ${order.deliveryFee.toFixed(2)} ${order.currency}`);
    doc.fontSize(14).text(`Total: ${order.total.toFixed(2)} ${order.currency}`);

    doc.moveDown(1.2);
    doc.fontSize(12).text('Verify this invoice', { underline: true });
    const verificationY = doc.y + 8;
    doc.image(qrBuffer, 48, verificationY, { width: 110, height: 110 });
    doc.image(barcodeBuffer, 180, verificationY + 10, { width: 300 });
    doc
      .fontSize(8)
      .text(
        'Scan the QR code in the AgriVision app or any camera to confirm the invoice against the live order record.',
        180,
        verificationY + 72,
        { width: 300 },
      );
    doc
      .fontSize(7)
      .text(`Verification code: ${verificationCode}`, 180, verificationY + 98, {
        width: 300,
      });

    doc.y = verificationY + 130;
    doc.moveDown();
    doc
      .fontSize(9)
      .text(
        'This invoice was generated from the persisted marketplace order record.',
      );
    doc.end();
  }

  private verifySignedInvoiceToken(token: string, orderId: string) {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) {
      throw new BadRequestException('Invalid invoice token');
    }
    const expected = this.sign(payload);
    const providedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      providedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      throw new BadRequestException('Invalid invoice token');
    }
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as { orderId: string; expiresAt: number };
    if (decoded.orderId !== orderId || decoded.expiresAt < Date.now()) {
      throw new BadRequestException(
        'Invoice token expired or does not match order',
      );
    }
  }

  private invoiceVerificationCode(order: MarketplaceOrder) {
    return createHmac('sha256', this.signingSecret())
      .update(
        [
          order.id,
          order.orderNumber,
          order.total.toFixed(2),
          order.currency,
          order.createdAt.toISOString(),
        ].join('|'),
      )
      .digest('base64url');
  }

  private sign(payload: string) {
    return createHmac('sha256', this.signingSecret())
      .update(payload)
      .digest('base64url');
  }

  private signingSecret() {
    return (
      this.config.get<string>('INVOICE_SIGNING_SECRET') ||
      this.config.getOrThrow<string>('ACCESS_TOKEN')
    );
  }

  private publicBaseUrl() {
    return this.config
      .get<string>('PUBLIC_API_URL', 'http://localhost:4000')
      .replace(/\/$/, '');
  }
}
