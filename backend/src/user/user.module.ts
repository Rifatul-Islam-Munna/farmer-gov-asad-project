import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AuthChallengeService } from '../auth/auth-challenge.service';
import { AuthChallenge } from '../auth/entities/auth-challenge.entity';
import { AuthSession } from '../auth/entities/auth-session.entity';
import { RolesGuard } from '../auth/roles.guard';
import { VerifiedAccountGuard } from '../auth/verified-account.guard';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, AuthSession, AuthChallenge])],
  controllers: [UserController],
  providers: [
    UserService,
    AuthChallengeService,
    AccessTokenGuard,
    RolesGuard,
    VerifiedAccountGuard,
  ],
  exports: [
    UserService,
    AuthChallengeService,
    AccessTokenGuard,
    RolesGuard,
    VerifiedAccountGuard,
    TypeOrmModule,
  ],
})
export class UserModule {}
