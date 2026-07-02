import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from './access-token.guard';

@Injectable()
export class VerifiedAccountGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user?.verificationStatus !== 'approved') {
      throw new ForbiddenException(
        'Your account must be approved before using this feature',
      );
    }

    return true;
  }
}
