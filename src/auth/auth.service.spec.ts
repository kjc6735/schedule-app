import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test/helpers/mock-prisma';
import { mockUser } from '../../test/helpers/fixtures';
import { AuthService } from './auth.service';

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
  compare: vi.fn(),
  hash: vi.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: MockPrismaService;
  let usersService: { getUser: ReturnType<typeof vi.fn> };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    usersService = { getUser: vi.fn() };
    jwtService = { signAsync: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: 'JWT_ACCESS_SECRET', useValue: 'access-secret' },
        { provide: 'JWT_REFRESH_SECRET', useValue: 'refresh-secret' },
        { provide: 'JWT_ACCESS_EXPIRES_IN', useValue: '1h' },
        { provide: 'JWT_REFRESH_EXPIRES_IN', useValue: '7d' },
        { provide: 'SALT_OR_ROUNDS', useValue: 10 },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw BadRequestException when user not found', async () => {
      usersService.getUser.mockResolvedValue(null);

      await expect(
        service.login({ userId: 'unknown', password: 'pass' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password does not match', async () => {
      usersService.getUser.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ userId: 'testuser', password: 'wrong' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return access and refresh tokens on success', async () => {
      usersService.getUser.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login({
        userId: 'testuser',
        password: 'password',
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('register', () => {
    const registerDto = {
      userId: 'newuser',
      password: 'password123',
      passwordConfirm: 'password123',
      gender: 'male' as const,
      phone: '01011112222',
      name: '새유저',
      role: 'worker' as const,
    };

    it('should throw BadRequestException when passwords do not match', async () => {
      await expect(
        service.register({ ...registerDto, passwordConfirm: 'different' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException when userId already exists', async () => {
      usersService.getUser.mockResolvedValueOnce(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when phone already exists', async () => {
      usersService.getUser
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should hash password and create user on success', async () => {
      usersService.getUser.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue(undefined);

      await service.register(registerDto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          phone: registerDto.phone,
          userId: registerDto.userId,
          password: 'hashed',
          gender: registerDto.gender,
          name: registerDto.name,
          role: registerDto.role,
        },
      });
    });

    it('should throw InternalServerErrorException when prisma create fails', async () => {
      usersService.getUser.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prisma.user.create.mockRejectedValue(new Error('DB Error'));

      await expect(service.register(registerDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('createToekn', () => {
    it('should call jwtService.signAsync with correct payload and options', async () => {
      jwtService.signAsync.mockResolvedValue('test-token');

      const result = await service.createToekn({
        user: mockUser as any,
        secret: 'test-secret',
        expiresIn: '1h',
        type: 'access_token',
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          userId: mockUser.userId,
          type: 'access_token',
          role: mockUser.role,
        },
        { secret: 'test-secret', expiresIn: '1h' },
      );
      expect(result).toBe('test-token');
    });
  });
});
