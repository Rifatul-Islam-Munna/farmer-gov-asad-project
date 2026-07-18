import {
  Controller,
  Get,
  INestApplication,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AccessTokenGuard } from '../src/auth/access-token.guard';
import { Roles } from '../src/auth/roles.decorator';
import { RolesGuard } from '../src/auth/roles.guard';
import { VerifiedAccountGuard } from '../src/auth/verified-account.guard';
import { UserType } from '../src/user/entities/user.entity';
import { AccessPayload, UserService } from '../src/user/user.service';

@Controller('e2e-security')
class SecurityTestController {
  @Get('authenticated')
  @UseGuards(AccessTokenGuard)
  authenticated() {
    return { ok: true };
  }

  @Get('verified-admin')
  @Roles(UserType.ADMIN, UserType.SUPER_ADMIN)
  @UseGuards(AccessTokenGuard, VerifiedAccountGuard, RolesGuard)
  verifiedAdmin() {
    return { ok: true };
  }
}

const payload = (overrides: Partial<AccessPayload> = {}): AccessPayload => ({
  id: 'user-1',
  email: 'user@example.test',
  mobileNumber: '01700000000',
  role: UserType.FARMER,
  roles: [UserType.FARMER],
  verificationStatus: 'approved',
  accountStatus: 'active',
  tokenVersion: 0,
  ...overrides,
});

describe('Authentication and RBAC (Supertest e2e)', () => {
  let app: INestApplication;
  const userService = {
    verifyAccessToken: jest.fn((token: string) => {
      if (token === 'invalid' || token === 'expired' || token === 'revoked') {
        return Promise.reject(
          new UnauthorizedException('Invalid, expired or revoked token'),
        );
      }
      if (token === 'farmer') return Promise.resolve(payload());
      if (token === 'unverified-admin') {
        return Promise.resolve(
          payload({
            id: 'admin-unverified',
            role: UserType.ADMIN,
            roles: [UserType.ADMIN],
            verificationStatus: 'pending',
          }),
        );
      }
      if (token === 'admin') {
        return Promise.resolve(
          payload({
            id: 'admin',
            role: UserType.ADMIN,
            roles: [UserType.ADMIN],
          }),
        );
      }
      if (token === 'multi-role-admin') {
        return Promise.resolve(
          payload({ roles: [UserType.FARMER, UserType.ADMIN] }),
        );
      }
      if (token === 'support-mode') {
        return Promise.resolve(
          payload({ supportMode: true, impersonatorId: 'admin' }),
        );
      }
      return Promise.reject(new UnauthorizedException('Invalid token'));
    }),
    findProfile: jest.fn((id: string) =>
      Promise.resolve({
        data: {
          verificationStatus:
            id === 'admin-unverified' ? 'pending' : 'approved',
        },
      }),
    ),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SecurityTestController],
      providers: [
        AccessTokenGuard,
        VerifiedAccountGuard,
        RolesGuard,
        Reflector,
        { provide: UserService, useValue: userService },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => app.close());

  it('rejects missing access tokens', () =>
    request(app.getHttpServer())
      .get('/e2e-security/authenticated')
      .expect(401));

  it.each(['invalid', 'expired', 'revoked'])(
    'rejects %s access tokens',
    (token) =>
      request(app.getHttpServer())
        .get('/e2e-security/authenticated')
        .set('Authorization', `Bearer ${token}`)
        .expect(401),
  );

  it('accepts a valid bearer token', () =>
    request(app.getHttpServer())
      .get('/e2e-security/authenticated')
      .set('Authorization', 'Bearer farmer')
      .expect(200, { ok: true }));

  it('accepts the legacy access_token header', () =>
    request(app.getHttpServer())
      .get('/e2e-security/authenticated')
      .set('access_token', 'farmer')
      .expect(200));

  it('rejects an unverified administrator', () =>
    request(app.getHttpServer())
      .get('/e2e-security/verified-admin')
      .set('Authorization', 'Bearer unverified-admin')
      .expect(403));

  it('rejects a verified user without an allowed role', () =>
    request(app.getHttpServer())
      .get('/e2e-security/verified-admin')
      .set('Authorization', 'Bearer farmer')
      .expect(403));

  it('accepts a verified administrator', () =>
    request(app.getHttpServer())
      .get('/e2e-security/verified-admin')
      .set('Authorization', 'Bearer admin')
      .expect(200));

  it('accepts an allowed role contained in a multi-role account', () =>
    request(app.getHttpServer())
      .get('/e2e-security/verified-admin')
      .set('Authorization', 'Bearer multi-role-admin')
      .expect(200));

  it('does not grant admin RBAC merely because a token is support-mode', () =>
    request(app.getHttpServer())
      .get('/e2e-security/verified-admin')
      .set('Authorization', 'Bearer support-mode')
      .expect(403));
});
