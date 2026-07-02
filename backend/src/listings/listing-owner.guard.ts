import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/access-token.guard';
import { ListingService } from './listing.service';

@Injectable()
export class ListingOwnerGuard implements CanActivate {
  constructor(private readonly listingService: ListingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const listingId = request.params.id;
    const allowed = await this.listingService.canManage(
      listingId,
      request.user.id,
      request.user.role,
    );

    if (!allowed) {
      throw new ForbiddenException('You do not own this listing');
    }

    return true;
  }
}
