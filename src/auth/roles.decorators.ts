import { SetMetadata } from '@nestjs/common';
//Roles to a route's metadata
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
