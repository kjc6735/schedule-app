import { User } from 'generated/prisma/browser';

export class UserDto {
  static from(user: User) {
    const { password, ...rest } = user;

    return rest;
  }
}
