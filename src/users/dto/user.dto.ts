import { User } from 'generated/prisma/browser';

export class UserDto {
  static from(user: User) {
    const { password, ...rest } = user;

    return rest;
  }

  static fromArray(users: User[]) {
    return users ? users.map((user) => UserDto.from(user)) : [];
  }
}
