import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function createMockExecutionContext(user?: { role: string }): ExecutionContext {
  const request = { user };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are defined', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockExecutionContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when roles array is empty', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const context = createMockExecutionContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has matching role', () => {
    reflector.getAllAndOverride.mockReturnValue(['manager', 'owner']);
    const context = createMockExecutionContext({ role: 'manager' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException when user has wrong role', () => {
    reflector.getAllAndOverride.mockReturnValue(['manager', 'owner']);
    const context = createMockExecutionContext({ role: 'worker' });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when user has no role', () => {
    reflector.getAllAndOverride.mockReturnValue(['manager', 'owner']);
    const context = createMockExecutionContext({} as any);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
