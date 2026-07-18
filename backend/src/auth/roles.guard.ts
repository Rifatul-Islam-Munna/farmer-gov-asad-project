import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '../user/entities/user.entity';
import { AuthenticatedRequest } from './access-token.guard';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!allowedRoles?.length) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRoles = request.user?.roles?.length
      ? request.user.roles
      : request.user
        ? [request.user.role]
        : [];

    if (!allowedRoles.some((role) => userRoles.includes(role))) {
      throw new ForbiddenException(
        'You do not have permission for this action',
      );
    }
    return true;
  }
}
