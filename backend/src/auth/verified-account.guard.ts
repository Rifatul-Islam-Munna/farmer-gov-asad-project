import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthenticatedRequest } from './access-token.guard';

@Injectable()
export class VerifiedAccountGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const profile = await this.userService.findProfile(request.user.id);

    if (profile.data.verificationStatus !== 'approved') {
      throw new ForbiddenException(
        'Your account must be approved before using this feature',
      );
    }

    return true;
  }
}
