import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from 'src/types/jwt';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('JWT_ACCESS_SECRET') private readonly accessTokenSecret: string,
    @Inject('JWT_REFRESH_SECRET') private readonly refreshTokenSecret: string,

    @Inject('JWT_ACCESS_EXPIRES_IN')
    private readonly accessExpiresIn: JwtSignOptions['expiresIn'],
    @Inject('JWT_REFRESH_EXPIRES_IN')
    private readonly refreshExpiresIn: JwtSignOptions['expiresIn'],
    @Inject('SALT_OR_ROUNDS') private readonly saltOrRounds: number,
  ) {}

  async login({ userId, password }: Pick<User, 'userId' | 'password'>) {
    const user = await this.userService.getUser({ userId });

    if (!user)
      throw new BadRequestException('아이디와 비밀번호를 다시 확인해주세요.');

    const hashedPassword = user.password;
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch)
      throw new BadRequestException('아이디와 비밀번호를 다시 확인해주세요.');

    const accessToken = await this.createToekn({
      user,
      type: 'access_token',
      secret: this.accessTokenSecret,
      expiresIn: this.accessExpiresIn,
    });
    const refreshToken = await this.createToekn({
      user,
      type: 'refresh_token',
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshExpiresIn,
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async register(
    param: Pick<
      User,
      'userId' | 'password' | 'gender' | 'phone' | 'name' | 'role'
    > & {
      passwordConfirm: string;
    },
  ) {
    const { userId, password, gender, phone, name, passwordConfirm, role } =
      param;

    if (password !== passwordConfirm) {
      throw new BadRequestException('비밀번호를 다시 확인해주세요.');
    }
    const existUserId = await this.userService.getUser({ userId });
    if (existUserId)
      throw new UnauthorizedException('이미 사용중인 아이디입니다.');
    const existUserPhone = await this.userService.getUser({ phone });

    if (existUserPhone)
      throw new UnauthorizedException('이미 사용중인 휴대폰 번호입니다.');

    const hashedPassword = await bcrypt.hash(password, this.saltOrRounds);

    try {
      await this.prisma.user.create({
        data: {
          phone,
          userId,
          password: hashedPassword,
          gender,
          name,
          role,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        '서버오류. 잠시 후 다시 시도해주세요',
      );
    }
  }

  async createToekn({
    user,
    secret,
    expiresIn,
    type,
  }: {
    user: User;
    secret: string;
    expiresIn: JwtSignOptions['expiresIn'];
    type: 'access_token' | 'refresh_token';
  }): Promise<string> {
    const { id, userId, role } = user;
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: id,
      userId: userId,
      type,
      role,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });

    return token;
  }
}
