import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export type JwtPayload = {
  email?: string;
  id: string;
  role: string | string[];
  phoneNumber?: string;
  mobileNumber?: string;
  verificationStatus?: string;
};

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const legacyToken = request.headers.access_token;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : typeof legacyToken === 'string'
        ? legacyToken
        : undefined;

    if (!token)
      throw new UnauthorizedException('Authentication token is required');

    try {
      const secret = this.configService.get<string>('ACCESS_TOKEN');
      if (!secret) throw new Error('ACCESS_TOKEN is not configured');
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });
      if (!decoded?.id || !decoded.role)
        throw new Error('Incomplete JWT payload');
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
