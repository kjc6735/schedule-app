import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

function createMockExecutionContext(
  overrides: {
    authorization?: string;
    isPublic?: boolean;
  } = {},
): ExecutionContext {
  const request = {
    headers: {
      authorization: overrides.authorization,
    },
    user: undefined,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: { verifyAsync: ReturnType<typeof vi.fn> };
  let reflector: { getAllAndOverride: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    jwtService = { verifyAsync: vi.fn() };
    reflector = { getAllAndOverride: vi.fn() };
    guard = new AuthGuard(
      jwtService as unknown as JwtService,
      reflector as unknown as Reflector,
    );
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access on public routes without token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockExecutionContext();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should set request.user when valid Bearer token provided', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const payload = { sub: 1, userId: 'test', role: 'worker' };
    jwtService.verifyAsync.mockResolvedValue(payload);
    const context = createMockExecutionContext({
      authorization: 'Bearer valid-token',
    });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual(payload);
  });

  it('should throw UnauthorizedException when no authorization header', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockExecutionContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when not Bearer type', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockExecutionContext({
      authorization: 'Basic some-token',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException with expired token message', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verifyAsync.mockRejectedValue(
      new TokenExpiredError('jwt expired', new Date()),
    );
    const context = createMockExecutionContext({
      authorization: 'Bearer expired-token',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('토큰이 만료되었습니다.'),
    );
  });

  it('should throw UnauthorizedException with corrupted token message', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verifyAsync.mockRejectedValue(
      new JsonWebTokenError('invalid token'),
    );
    const context = createMockExecutionContext({
      authorization: 'Bearer corrupted-token',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('손상된 토큰입니다.'),
    );
  });
});
