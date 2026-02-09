import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { App } from 'supertest/types';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaExceptionFilter } from 'src/common/filter/prisma-exception.filter';
import { createMockPrismaService, MockPrismaService } from './mock-prisma';

export async function createTestApp(): Promise<{
  app: INestApplication<App>;
  prisma: MockPrismaService;
  jwtService: JwtService;
}> {
  const prisma = createMockPrismaService();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.init();

  const jwtService = moduleFixture.get<JwtService>(JwtService);

  return { app, prisma, jwtService };
}

export function createAccessToken(
  jwtService: JwtService,
  payload: { sub: number; userId: string; role: string },
): Promise<string> {
  return jwtService.signAsync({
    ...payload,
    type: 'access_token',
  });
}

export const adminPayload = {
  sub: 2,
  userId: 'admin',
  role: 'manager',
};

export const workerPayload = {
  sub: 1,
  userId: 'testuser',
  role: 'worker',
};
