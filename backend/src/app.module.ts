import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentModule } from './agents/agent.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DealModule } from './deals/deal.module';
import { GoodModule } from './goods/good.module';
import { ListingModule } from './listings/listing.module';
import { MarketDataModule } from './market-data.module';
import { MedicineSellerModule } from './medicine-sellers/medicine-seller.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('ACCESS_TOKEN'),
        signOptions: { expiresIn: '10d' },
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL') ??
          'mongodb://127.0.0.1:27017/farmer-gov-asad-project',
        autoIndex: true,
      }),
    }),
    UserModule,
    GoodModule,
    MarketDataModule,
    ListingModule,
    DealModule,
    AgentModule,
    MedicineSellerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
