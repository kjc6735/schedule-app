import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './helpers/e2e-setup';
import { MockPrismaService } from './helpers/mock-prisma';
import { mockUser } from './helpers/fixtures';

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
  compare: vi.fn(),
  hash: vi.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: MockPrismaService;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should return tokens on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ userId: 'testuser', password: 'password123' })
        .expect(201);

      expect(response.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it('should return 400 on invalid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ userId: 'unknown', password: 'wrong' })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: '아이디와 비밀번호를 다시 확인해주세요.',
        }),
      );
    });
  });

  describe('POST /auth/register', () => {
    const registerDto = {
      userId: 'newuser',
      password: 'password123',
      passwordConfirm: 'password123',
      gender: 'male',
      phone: '01011112222',
      name: '새유저',
      role: 'worker',
    };

    it('should register successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prisma.user.create.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);
    });

    it('should return 400 when passwords do not match', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerDto, passwordConfirm: 'different' })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 400,
          message: '비밀번호를 다시 확인해주세요.',
        }),
      );
    });

    it('should return 401 when userId already exists', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 401,
          message: '이미 사용중인 아이디입니다.',
        }),
      );
    });
  });
});
