import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { USER_MODEL, UserSchema } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: USER_MODEL, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    AccessTokenGuard,
    RolesGuard,
    VerifiedAccountGuard,
  ],
  exports: [UserService, AccessTokenGuard, RolesGuard, VerifiedAccountGuard],
})
export class UserModule {}
