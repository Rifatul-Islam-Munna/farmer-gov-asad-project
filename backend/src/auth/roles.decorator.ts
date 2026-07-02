import { SetMetadata } from '@nestjs/common';
import { UserType } from '../user/user.entity';

export const ROLES_KEY = 'allowed-roles';

export const Roles = (...roles: UserType[]) => SetMetadata(ROLES_KEY, roles);
