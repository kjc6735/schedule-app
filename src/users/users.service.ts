import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.findUnique({ where });
  }

  async getUsers({ page = 1, take = 20 }: { page: number; take: number }) {
    const skip = (page - 1) * take;

    const data = await this.prisma.user.findMany({
      skip,
      take: take + 1,
    });

    const users = data.map((user) => UserDto.from(user));

    return users;
  }
}
