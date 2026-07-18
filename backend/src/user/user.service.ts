import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { Brackets, IsNull, Repository } from 'typeorm';
import { AuditService } from '../audit/audit.service';
import { AuthSession } from '../auth/entities/auth-session.entity';
import { toApiEntity } from '../lib/database/base.entity';
import {
  CreateUserDto,
  LoginDto,
  UpdateMyLocationDto,
  UpdateMyProfileDto,
} from './dto/user.dto';
import {
  AccountStatus,
  User,
  UserType,
  VerificationStatus,
} from './entities/user.entity';

export type AccessPayload = {
  email: string;
  id: string;
  role: UserType;
  roles: UserType[];
  mobileNumber: string;
  verificationStatus: VerificationStatus;
  accountStatus: AccountStatus;
  tokenVersion: number;
  supportMode?: boolean;
  impersonatorId?: string;
};

type RefreshPayload = {
  sub: string;
  jti: string;
  type: 'refresh';
  tokenVersion: number;
};

type SessionContext = {
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuthSession)
    private readonly sessionRepository: Repository<AuthSession>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async onModuleInit() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    if (!adminEmail || !adminPassword) return;

    const normalized = adminEmail.trim().toLowerCase();
    const existing = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.credentialHash')
      .where('LOWER(user.email) = :normalized', { normalized })
      .orWhere('user.phoneNumber = :normalized', { normalized })
      .getOne();

    const values: Partial<User> = {
      name: existing?.name || 'admin',
      email: normalized,
      phoneNumber: normalized,
      credentialHash: await bcrypt.hash(adminPassword, 10),
      role: UserType.ADMIN,
      roles: [UserType.ADMIN],
      accountStatus: 'active',
      verificationStatus: 'approved',
      isOtpVerified: true,
      documents: existing?.documents ?? [],
      planName: existing?.planName ?? 'Free',
      planFeatures: existing?.planFeatures ?? {},
    };
    await this.userRepository.save(
      this.userRepository.create({ ...(existing ?? {}), ...values }),
    );
  }

  async create(dto: CreateUserDto, context: SessionContext = {}) {
    if ([UserType.ADMIN, UserType.SUPER_ADMIN].includes(dto.role)) {
      throw new ForbiddenException(
        'Administrative accounts cannot be publicly created',
      );
    }

    const phoneNumber = dto.phoneNumber.trim();
    const email = dto.email?.trim().toLowerCase();
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber });
    if (email) query.orWhere('LOWER(user.email) = :email', { email });
    if (await query.getExists()) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const autoApprovedRoles = [
      UserType.FARMER,
      UserType.BUYER,
      UserType.PUBLIC_USER,
    ];
    const verificationStatus: VerificationStatus = autoApprovedRoles.includes(
      dto.role,
    )
      ? 'approved'
      : 'pending';
    const user = await this.userRepository.save(
      this.userRepository.create({
        name: dto.name.trim(),
        phoneNumber,
        email,
        gender: dto.gender,
        role: dto.role,
        roles: [dto.role],
        accountStatus: 'active',
        tokenVersion: 0,
        landAmount: dto.landAmount,
        documents: dto.documents ?? [],
        businessName: dto.businessName,
        shopName: dto.shopName,
        address: dto.address,
        verificationStatus,
        credentialHash: await bcrypt.hash(dto.password, 10),
        isOtpVerified: false,
        otpNumber: null,
        planName: 'Free',
        planFeatures: {},
      }),
    );

    const tokens = await this.issueTokenPair(user, context);
    const safeUser = this.safe(user);
    return {
      message: 'User created successfully',
      data: safeUser,
      user: safeUser,
      ...tokens,
    };
  }

  async loginUser(dto: LoginDto, context: SessionContext = {}) {
    const login = dto.phoneNumber.trim().toLowerCase();
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.credentialHash')
      .where('LOWER(user.phoneNumber) = :login', { login })
      .orWhere('LOWER(user.email) = :login', { login })
      .getOne();

    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    if (user.accountStatus !== 'active') {
      throw new ForbiddenException(`Account is ${user.accountStatus}`);
    }
    if (!(await bcrypt.compare(dto.password, user.credentialHash))) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const tokens = await this.issueTokenPair(user, context);
    await this.auditService.record({
      actorUserId: user.id,
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
      metadata: { role: user.role },
      ...context,
    });
    return {
      message: 'User logged in successfully',
      ...tokens,
      user: this.safe(user),
    };
  }

  async refresh(refreshToken: string, context: SessionContext = {}) {
    let payload: RefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(
        refreshToken,
        {
          secret: this.refreshSecret(),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (payload.type !== 'refresh' || !payload.sub || !payload.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.sessionRepository
      .createQueryBuilder('session')
      .addSelect('session.tokenHash')
      .where('session.tokenId = :tokenId', { tokenId: payload.jti })
      .andWhere('session.userId = :userId', { userId: payload.sub })
      .andWhere('session.revokedAt IS NULL')
      .getOne();
    if (!session || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh session is no longer active');
    }
    if (session.tokenHash !== this.hashToken(refreshToken)) {
      await this.revokeAllSessions(payload.sub, 'refresh-token-reuse');
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (
      !user ||
      user.accountStatus !== 'active' ||
      user.tokenVersion !== payload.tokenVersion
    ) {
      throw new UnauthorizedException('Account session is no longer active');
    }

    session.revokedAt = new Date();
    session.revokeReason = 'rotated';
    await this.sessionRepository.save(session);
    return this.issueTokenPair(user, context);
  }

  async logout(userId: string) {
    await this.revokeAllSessions(userId, 'logout');
    await this.userRepository.increment({ id: userId }, 'tokenVersion', 1);
    await this.auditService.record({
      actorUserId: userId,
      action: 'auth.logout-all',
      entityType: 'user',
      entityId: userId,
    });
    return { message: 'All active sessions were logged out successfully' };
  }

  async changeActiveRole(userId: string, role: UserType) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    if (!user.roles.includes(role)) {
      throw new ForbiddenException(
        'This role is not approved for your account',
      );
    }
    const before = { role: user.role };
    user.role = role;
    user.tokenVersion += 1;
    await this.userRepository.save(user);
    await this.revokeAllSessions(user.id, 'active-role-changed');
    await this.auditService.record({
      actorUserId: user.id,
      action: 'user.active-role.changed',
      entityType: 'user',
      entityId: user.id,
      before,
      after: { role },
    });
    return {
      message: 'Active role changed. Please sign in again.',
      data: this.safe(user),
    };
  }

  async setVerificationStatus(
    actorUserId: string,
    userId: string,
    status: VerificationStatus,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    const before = { verificationStatus: user.verificationStatus };
    user.verificationStatus = status;
    user.tokenVersion += 1;
    await this.userRepository.save(user);
    await this.revokeAllSessions(user.id, 'verification-status-changed');
    await this.auditService.record({
      actorUserId,
      action: 'user.verification.changed',
      entityType: 'user',
      entityId: user.id,
      before,
      after: { verificationStatus: status },
    });
    return {
      message: `Verification status changed to ${status}`,
      data: this.safe(user),
    };
  }

  async setAccountStatus(
    actorUserId: string,
    userId: string,
    status: AccountStatus,
    reason?: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    const before = { accountStatus: user.accountStatus };
    user.accountStatus = status;
    user.tokenVersion += 1;
    if (status === 'deleted') user.deletedAt = new Date();
    if (status === 'active') user.deletedAt = null;
    await this.userRepository.save(user);
    await this.revokeAllSessions(user.id, `account-${status}`);
    await this.auditService.record({
      actorUserId,
      action: `user.account.${status}`,
      entityType: 'user',
      entityId: user.id,
      before,
      after: { accountStatus: status },
      metadata: { reason: reason ?? '' },
    });
    return { message: `Account marked ${status}`, data: this.safe(user) };
  }

  async setRoles(actorUserId: string, userId: string, roles: UserType[]) {
    const uniqueRoles = [...new Set(roles)];
    if (!uniqueRoles.length)
      throw new ConflictException('At least one role is required');
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    const before = { role: user.role, roles: user.roles };
    user.roles = uniqueRoles;
    if (!uniqueRoles.includes(user.role)) user.role = uniqueRoles[0];
    user.tokenVersion += 1;
    await this.userRepository.save(user);
    await this.revokeAllSessions(user.id, 'roles-changed');
    await this.auditService.record({
      actorUserId,
      action: 'user.roles.changed',
      entityType: 'user',
      entityId: user.id,
      before,
      after: { role: user.role, roles: user.roles },
    });
    return { message: 'Roles updated', data: this.safe(user) };
  }

  async verifyOtp(otp: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.otpNumber')
      .where('user.otpNumber = :otp', { otp })
      .getOne();
    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    user.isOtpVerified = true;
    user.otpNumber = null;
    user.otpValidatedAt = new Date();
    await this.userRepository.save(user);
    const safeUser = this.safe(user);
    return {
      message: 'User verified successfully',
      data: safeUser,
      user: safeUser,
    };
  }

  async findProfile(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    const monthKey = new Date().toISOString().slice(0, 7);
    if (user.monthlyUsageKey !== monthKey) {
      user.monthlyUsageKey = monthKey;
      user.monthlyEmailsUsed = 0;
      await this.userRepository.save(user);
    }
    return { data: this.safe(user) };
  }

  async updateProfile(id: string, dto: UpdateMyProfileDto) {
    const phoneNumber = dto.phoneNumber?.trim();
    const email = dto.email?.trim().toLowerCase();
    if (phoneNumber || email) {
      const qb = this.userRepository
        .createQueryBuilder('user')
        .where('user.id != :id', { id })
        .andWhere(
          new Brackets((inner) => {
            if (phoneNumber)
              inner.where('user.phoneNumber = :phoneNumber', { phoneNumber });
            if (email && phoneNumber)
              inner.orWhere('LOWER(user.email) = :email', { email });
            else if (email)
              inner.where('LOWER(user.email) = :email', { email });
          }),
        );
      if (await qb.getExists()) {
        throw new ConflictException('Phone number or email is already in use');
      }
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    Object.assign(user, {
      ...(dto.name != null ? { name: dto.name.trim() } : {}),
      ...(phoneNumber != null ? { phoneNumber } : {}),
      ...(email != null ? { email } : {}),
      ...(dto.gender != null ? { gender: dto.gender.trim() } : {}),
      ...(dto.landAmount != null ? { landAmount: dto.landAmount } : {}),
      ...(dto.documents != null ? { documents: dto.documents } : {}),
      ...(dto.businessName != null
        ? { businessName: dto.businessName.trim() }
        : {}),
      ...(dto.shopName != null ? { shopName: dto.shopName.trim() } : {}),
      ...(dto.address != null ? { address: dto.address.trim() } : {}),
    });
    await this.userRepository.save(user);
    return { message: 'Profile updated successfully', data: this.safe(user) };
  }

  async updateLocation(id: string, dto: UpdateMyLocationDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    user.location = {
      latitude: dto.latitude,
      longitude: dto.longitude,
      updatedAt: new Date().toISOString(),
    };
    await this.userRepository.save(user);
    return { message: 'Location saved successfully', data: this.safe(user) };
  }

  async issueSupportModeToken(
    actorUserId: string,
    targetUserId: string,
    reason: string,
    context: SessionContext = {},
  ) {
    if (
      this.configService.get<string>('SUPPORT_IMPERSONATION_ENABLED') !== 'true'
    ) {
      throw new ForbiddenException('Support impersonation is disabled');
    }
    const actor = await this.userRepository.findOne({
      where: { id: actorUserId },
    });
    const target = await this.userRepository.findOne({
      where: { id: targetUserId },
    });
    if (
      !actor ||
      ![UserType.ADMIN, UserType.SUPER_ADMIN].includes(actor.role)
    ) {
      throw new ForbiddenException('Administrative support access is required');
    }
    if (!target || target.accountStatus !== 'active') {
      throw new ForbiddenException('Target account is unavailable');
    }
    if (
      [UserType.ADMIN, UserType.SUPER_ADMIN].some((role) =>
        target.roles.includes(role),
      )
    ) {
      throw new ForbiddenException(
        'Administrative accounts cannot be impersonated',
      );
    }
    const accessToken = await this.jwtService.signAsync(
      {
        ...this.accessPayload(target),
        supportMode: true,
        impersonatorId: actor.id,
      } satisfies AccessPayload,
      {
        secret: this.configService.getOrThrow<string>('ACCESS_TOKEN'),
        expiresIn: 900,
      },
    );
    await this.auditService.record({
      actorUserId: actor.id,
      action: 'support.impersonation.started',
      entityType: 'user',
      entityId: target.id,
      metadata: { reason, expiresInSeconds: 900, targetRole: target.role },
      ...context,
    });
    return {
      access_token: accessToken,
      expires_in: 900,
      supportMode: true,
      targetUser: this.safe(target),
    };
  }

  async verifyAccessToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<AccessPayload>(token, {
        secret: this.configService.getOrThrow<string>('ACCESS_TOKEN'),
      });
      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      });
      if (
        !user ||
        user.accountStatus !== 'active' ||
        user.tokenVersion !== payload.tokenVersion
      ) {
        throw new Error('Session revoked');
      }
      return {
        ...this.accessPayload(user),
        ...(payload.supportMode ? { supportMode: true } : {}),
        ...(payload.impersonatorId
          ? { impersonatorId: payload.impersonatorId }
          : {}),
      };
    } catch {
      throw new UnauthorizedException('Invalid, expired or revoked token');
    }
  }

  private async issueTokenPair(user: User, context: SessionContext) {
    const tokenId = randomUUID();
    const accessToken = await this.jwtService.signAsync(
      this.accessPayload(user),
      {
        secret: this.configService.getOrThrow<string>('ACCESS_TOKEN'),
        expiresIn: this.configService.get<number>(
          'ACCESS_TOKEN_EXPIRES_SECONDS',
          864000,
        ),
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        jti: tokenId,
        type: 'refresh',
        tokenVersion: user.tokenVersion,
      } satisfies RefreshPayload,
      {
        secret: this.refreshSecret(),
        expiresIn: this.configService.get<number>(
          'REFRESH_TOKEN_EXPIRES_SECONDS',
          2592000,
        ),
      },
    );
    const decoded = this.jwtService.decode<{ exp?: number }>(refreshToken);
    await this.sessionRepository.save(
      this.sessionRepository.create({
        userId: user.id,
        tokenId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date((decoded.exp ?? 0) * 1000),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }),
    );
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  private async revokeAllSessions(userId: string, reason: string) {
    await this.sessionRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date(), revokeReason: reason },
    );
  }

  private accessPayload(user: User): AccessPayload {
    const roles = user.roles?.length ? user.roles : [user.role];
    return {
      email: user.email ?? '',
      id: user.id,
      role: user.role,
      roles,
      mobileNumber: user.phoneNumber,
      verificationStatus: user.verificationStatus,
      accountStatus: user.accountStatus,
      tokenVersion: user.tokenVersion,
    };
  }

  private refreshSecret() {
    return (
      this.configService.get<string>('REFRESH_TOKEN_SECRET') ??
      this.configService.getOrThrow<string>('ACCESS_TOKEN')
    );
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private safe(user: User) {
    const {
      credentialHash: _credentialHash,
      otpNumber: _otpNumber,
      ...safe
    } = user;
    return toApiEntity(safe as User);
  }
}
