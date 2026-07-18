import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';
import { AgentModule } from './agents/agent.module';
import { AlertModule } from './alerts/alert.module';
import { AuditModule } from './audit/audit.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DealModule } from './deals/deal.module';
import { GoodModule } from './goods/good.module';
import { DatabaseModule } from './lib/database/database.module';
import { HealthModule } from './lib/health/health.module';
import { RequestIdMiddleware } from './lib/http/request-id.middleware';
import { ResponseEnvelopeInterceptor } from './lib/http/response-envelope.interceptor';
import { InfrastructureModule } from './lib/infrastructure/infrastructure.module';
import { QueueModule } from './lib/queue/queue.module';
import { StorageModule } from './lib/storage/storage.module';
import { ListingModule } from './listings/listing.module';
import { MarketDataModule } from './market-data.module';
import { MedicineSellerModule } from './medicine-sellers/medicine-seller.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { SupportModule } from './support.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('ACCESS_TOKEN'),
        signOptions: { expiresIn: '10d' },
      }),
    }),
    StorageModule,
    InfrastructureModule,
    QueueModule,
    HealthModule,
    AlertModule,
    AuditModule,
    UserModule,
    AdminModule,
    SupportModule,
    GoodModule,
    MarketDataModule,
    ListingModule,
    DealModule,
    AgentModule,
    MedicineSellerModule,
    MarketplaceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseEnvelopeInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
