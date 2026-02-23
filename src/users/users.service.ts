import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { paginate } from 'src/common/dto/paginated-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto/user.dto';

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

  async getMe(id: number) {
    const user = await this.getUser({ id });
    if (!user || user.id != id) throw new UnauthorizedException('권한 없음');
    return UserDto.from(user);
  }
}
