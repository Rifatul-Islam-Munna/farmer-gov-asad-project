import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, AccessTokenGuard, RolesGuard, VerifiedAccountGuard],
  exports: [
    UserService,
    AccessTokenGuard,
    RolesGuard,
    VerifiedAccountGuard,
    TypeOrmModule,
  ],
})
export class UserModule {}
