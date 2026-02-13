import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { paginate } from 'src/common/dto/paginated-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(where: Prisma.UserWhereUniqueInput) {
    const user = await this.prisma.user.findUnique({ where });
    return user;
  }

  async getUsers({ page = 1, take = 20 }: { page: number; take: number }) {
    const skip = (page - 1) * take;

    const data = await this.prisma.user.findMany({
      skip,
      take: take + 1,
    });

    return paginate(data, take);
  }
}
