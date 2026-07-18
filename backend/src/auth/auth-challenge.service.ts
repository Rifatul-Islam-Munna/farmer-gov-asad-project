import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { IsNull, MoreThan, Repository } from 'typeorm';
import {
  AuthChallenge,
  AuthChallengePurpose,
} from './entities/auth-challenge.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthChallengeService {
  constructor(
    @InjectRepository(AuthChallenge)
    private readonly challenges: Repository<AuthChallenge>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async requestPhoneVerification(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    return this.issue(user.phoneNumber, 'phoneVerification', user.id);
  }

  async confirmPhoneVerification(userId: string, code: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    await this.consume(user.phoneNumber, 'phoneVerification', code, user.id);
    user.isOtpVerified = true;
    user.otpValidatedAt = new Date();
    await this.users.save(user);
    return { message: 'Phone number verified successfully' };
  }

  async requestPasswordReset(destination: string) {
    const normalized = destination.trim().toLowerCase();
    const user = await this.users
      .createQueryBuilder('user')
      .where('LOWER(user.phoneNumber) = :normalized', { normalized })
      .orWhere('LOWER(user.email) = :normalized', { normalized })
      .getOne();
    if (!user) {
      return { message: 'If the account exists, a reset code has been sent' };
    }
    const issued = await this.issue(user.phoneNumber, 'passwordReset', user.id);
    return {
      ...issued,
      message: 'If the account exists, a reset code has been sent',
    };
  }

  async confirmPasswordReset(
    destination: string,
    code: string,
    newPassword: string,
  ) {
    const normalized = destination.trim().toLowerCase();
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.credentialHash')
      .where('LOWER(user.phoneNumber) = :normalized', { normalized })
      .orWhere('LOWER(user.email) = :normalized', { normalized })
      .getOne();
    if (!user) throw new UnauthorizedException('Invalid reset request');
    await this.consume(user.phoneNumber, 'passwordReset', code, user.id);
    user.credentialHash = await bcrypt.hash(newPassword, 10);
    user.tokenVersion += 1;
    await this.users.save(user);
    return { message: 'Password reset successfully. Sign in again.' };
  }

  private async issue(
    destination: string,
    purpose: AuthChallengePurpose,
    userId?: string,
  ) {
    const now = new Date();
    const cooldownSeconds = this.config.get<number>(
      'OTP_RESEND_COOLDOWN_SECONDS',
      60,
    );
    const active = await this.challenges.findOne({
      where: {
        destination,
        purpose,
        consumedAt: IsNull(),
        expiresAt: MoreThan(now),
      },
      order: { createdAt: 'DESC' },
    });
    if (active && active.resendAvailableAt > now) {
      throw new HttpException(
        `Try again after ${Math.ceil((active.resendAvailableAt.getTime() - now.getTime()) / 1000)} seconds`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const dailyCount = await this.challenges
      .createQueryBuilder('challenge')
      .where('challenge.destination = :destination', { destination })
      .andWhere('challenge.createdAt >= :since', {
        since: new Date(Date.now() - 24 * 60 * 60 * 1000),
      })
      .getCount();
    if (dailyCount >= this.config.get<number>('OTP_DAILY_LIMIT', 10)) {
      throw new HttpException(
        'Daily OTP limit reached',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = randomInt(100000, 1000000).toString();
    const expiresMinutes = this.config.get<number>('OTP_EXPIRES_MINUTES', 5);
    await this.challenges.save(
      this.challenges.create({
        userId,
        destination,
        purpose,
        codeHash: await bcrypt.hash(code, 10),
        expiresAt: new Date(Date.now() + expiresMinutes * 60 * 1000),
        resendAvailableAt: new Date(Date.now() + cooldownSeconds * 1000),
        attempts: 0,
        maxAttempts: this.config.get<number>('OTP_MAX_ATTEMPTS', 5),
      }),
    );

    await this.deliver(destination, code, purpose);
    const expose =
      this.config.get<string>('NODE_ENV') !== 'production' &&
      this.config.get<string>('OTP_EXPOSE_CODE_IN_DEVELOPMENT', 'true') ===
        'true';
    return {
      message: 'Verification code sent',
      expiresInSeconds: expiresMinutes * 60,
      resendAfterSeconds: cooldownSeconds,
      ...(expose ? { developmentCode: code } : {}),
    };
  }

  private async consume(
    destination: string,
    purpose: AuthChallengePurpose,
    code: string,
    userId?: string,
  ) {
    const challenge = await this.challenges
      .createQueryBuilder('challenge')
      .addSelect('challenge.codeHash')
      .where('challenge.destination = :destination', { destination })
      .andWhere('challenge.purpose = :purpose', { purpose })
      .andWhere('challenge.consumedAt IS NULL')
      .orderBy('challenge.createdAt', 'DESC')
      .getOne();
    if (!challenge || challenge.expiresAt <= new Date()) {
      throw new UnauthorizedException('Code expired or invalid');
    }
    if (userId && challenge.userId && challenge.userId !== userId) {
      throw new ForbiddenException('Challenge does not belong to this user');
    }
    if (challenge.attempts >= challenge.maxAttempts) {
      throw new HttpException(
        'Maximum code attempts reached',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    challenge.attempts += 1;
    const valid = await bcrypt.compare(code, challenge.codeHash);
    if (!valid) {
      await this.challenges.save(challenge);
      throw new UnauthorizedException('Invalid verification code');
    }
    challenge.consumedAt = new Date();
    await this.challenges.save(challenge);
  }

  private async deliver(
    destination: string,
    code: string,
    purpose: AuthChallengePurpose,
  ) {
    const endpoint = this.config.get<string>('OTP_PROVIDER_URL');
    const apiKey = this.config.get<string>('OTP_PROVIDER_API_KEY');
    if (!endpoint || !apiKey) {
      if (this.config.get<string>('NODE_ENV') === 'production') {
        throw new BadRequestException('OTP provider is not configured');
      }
      return;
    }
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ destination, code, purpose }),
    });
    if (!response.ok)
      throw new BadRequestException('OTP provider delivery failed');
  }
}
