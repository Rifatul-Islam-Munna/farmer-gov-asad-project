import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessPayload, UserService } from '../user/user.service';

export const AuthenticatedRequest = Symbol('AuthenticatedRequest');

export interface AuthenticatedRequest extends Request {
  user: AccessPayload;
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.getToken(request);
    request.user = await this.userService.verifyAccessToken(token);
    return true;
  }

  private getToken(request: Request): string {
    const headerToken = request.headers.access_token;
    const authorization = request.headers.authorization;
    const bearerToken = authorization?.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : undefined;
    const token =
      (Array.isArray(headerToken) ? headerToken[0] : headerToken) ??
      bearerToken;

    if (!token) {
      throw new UnauthorizedException('No access token found');
    }

    return token;
  }
}
