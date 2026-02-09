import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  createTestApp,
  createAccessToken,
  adminPayload,
  workerPayload,
} from './helpers/e2e-setup';
import { MockPrismaService } from './helpers/mock-prisma';
import { mockProductionPlan } from './helpers/fixtures';

describe('ProductionPlans (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: MockPrismaService;
  let jwtService: JwtService;
  let adminToken: string;
  let workerToken: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    jwtService = testApp.jwtService;
    adminToken = await createAccessToken(jwtService, adminPayload);
    workerToken = await createAccessToken(jwtService, workerPayload);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /production-plans', () => {
    it('should create production plan when admin', async () => {
      prisma.productionPlan.create.mockResolvedValue(mockProductionPlan);

      const response = await request(app.getHttpServer())
        .post('/production-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productionDate: '2026-02-01T00:00:00.000Z',
          productId: 1,
          packagingSpecId: 1,
          targetAmountGram: 10000,
          memo: '메모',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should return 401 when worker tries to create', async () => {
      await request(app.getHttpServer())
        .post('/production-plans')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({
          productionDate: '2026-02-01T00:00:00.000Z',
          productId: 1,
          packagingSpecId: 1,
          targetAmountGram: 10000,
          memo: '메모',
        })
        .expect(401);
    });
  });

  describe('GET /production-plans', () => {
    it('should return production plans list', async () => {
      prisma.productionPlan.findMany.mockResolvedValue([mockProductionPlan]);

      const response = await request(app.getHttpServer())
        .get('/production-plans')
        .set('Authorization', `Bearer ${workerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /production-plans/:id', () => {
    it('should return production plan by id', async () => {
      prisma.productionPlan.findUnique.mockResolvedValue(mockProductionPlan);

      const response = await request(app.getHttpServer())
        .get('/production-plans/1')
        .set('Authorization', `Bearer ${workerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('PATCH /production-plans/:id', () => {
    it('should update when admin', async () => {
      prisma.productionPlan.update.mockResolvedValue({
        ...mockProductionPlan,
        resultAmountGram: 9500,
      });

      await request(app.getHttpServer())
        .patch('/production-plans/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ resultAmountGram: 9500 })
        .expect(200);
    });

    it('should return 401 when worker tries to update', async () => {
      await request(app.getHttpServer())
        .patch('/production-plans/1')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({ resultAmountGram: 9500 })
        .expect(401);
    });
  });

  describe('DELETE /production-plans/:id', () => {
    it('should delete when admin', async () => {
      prisma.productionPlan.delete.mockResolvedValue(mockProductionPlan);

      await request(app.getHttpServer())
        .delete('/production-plans/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should return 401 when worker tries to delete', async () => {
      await request(app.getHttpServer())
        .delete('/production-plans/1')
        .set('Authorization', `Bearer ${workerToken}`)
        .expect(401);
    });
  });
});
