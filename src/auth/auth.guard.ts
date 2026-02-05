import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  JsonWebTokenError,
  JwtService,
  NotBeforeError,
  TokenExpiredError,
} from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/common/decorator/public.decorator';
import { JwtPayload } from 'src/types/jwt';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly JwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer')
      throw new UnauthorizedException('접속할 수 없습니다.');

    try {
      const payload = await this.JwtService.verifyAsync<JwtPayload>(token);
      request.user = payload;
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnauthorizedException('토큰이 만료되었습니다.');
      }
      if (e instanceof NotBeforeError) {
        throw new UnauthorizedException('아직 유효하지 않은 토큰입니다.');
      }
      if (e instanceof JsonWebTokenError) {
        throw new UnauthorizedException('손상된 토큰입니다.');
      }
      throw new UnauthorizedException('인증 실패');
    }

    return true;
  }
}
