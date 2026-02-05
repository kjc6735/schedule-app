import { Role } from 'generated/prisma/enums';

export class RegisterRequestDto {
  name: string;
  password: string;
  passwordConfirm: string;
  gender: 'male' | 'female';
  phone: string;
  role: Role;
  userId: string;
}
