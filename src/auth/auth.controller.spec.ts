import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      login: vi.fn(),
      register: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with dto', async () => {
      const dto = { userId: 'test', password: 'pass' };
      const tokens = { accessToken: 'at', refreshToken: 'rt' };
      authService.login.mockResolvedValue(tokens);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(tokens);
    });
  });

  describe('register', () => {
    it('should call authService.register with dto', async () => {
      const dto = {
        userId: 'new',
        password: 'pass',
        passwordConfirm: 'pass',
        gender: 'male' as const,
        phone: '01012345678',
        name: '테스트',
        role: 'worker' as const,
      };
      authService.register.mockResolvedValue(undefined);

      await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });
});
