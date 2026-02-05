import { Role } from 'generated/prisma/enums';

export interface JwtPayload {
  sub: number;
  userId: string;
  role: Role;
  type: 'access_token' | 'refresh_token';
  iat: number;
  exp: number;
}
