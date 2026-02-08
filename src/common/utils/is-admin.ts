import { Role } from 'generated/prisma/enums';

const adminRole = [Role.manager, Role.owner] as Role[];

export function isAdmin(role: Role) {
  return adminRole.includes(role);
}
