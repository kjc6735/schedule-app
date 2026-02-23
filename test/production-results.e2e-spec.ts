import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  adminPayload,
  createAccessToken,
  createTestApp,
  workerPayload,
} from './helpers/e2e-setup';
import { mockPackagingSpec, mockProductionPlan, mockProductionResult } from './helpers/fixtures';
import { MockPrismaService } from './helpers/mock-prisma';

const mockPlanWithSpec = {
  ...mockProductionPlan,
  packagingSpec: mockPackagingSpec,
};

const mockResultWithPlan = {
  ...mockProductionResult,
  productionPlan: mockPlanWithSpec,
};

describe('ProductionResults (e2e)', () => {
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

  describe('POST /production-plans/:planId/result', () => {
    it('should create production result when authenticated', async () => {
      prisma.productionPlan.findUnique.mockResolvedValue(mockPlanWithSpec);
      prisma.productionResult.create.mockResolvedValue(mockProductionResult);

      const response = await request(app.getHttpServer())
        .post('/production-plans/1/result')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({ boxCount: 10, packsPerBox: 5, remainingPackCount: 3 })
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockProductionResult.id,
          productionPlanId: mockProductionResult.productionPlanId,
          totalPackCount: mockProductionResult.totalPackCount,
          totalAmountGram: mockProductionResult.totalAmountGram,
        }),
      );
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/production-plans/1/result')
        .send({ boxCount: 10, packsPerBox: 5, remainingPackCount: 3 })
        .expect(401);
    });
  });

  describe('GET /production-plans/:planId/result', () => {
    it('should return production result', async () => {
      prisma.productionResult.findUnique.mockResolvedValue(mockProductionResult);

      const response = await request(app.getHttpServer())
        .get('/production-plans/1/result')
        .set('Authorization', `Bearer ${workerToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockProductionResult.id,
          productionPlanId: mockProductionResult.productionPlanId,
        }),
      );
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/production-plans/1/result')
        .expect(401);
    });
  });

  describe('PATCH /production-plans/:planId/result', () => {
    it('should update production result', async () => {
      const updated = { ...mockProductionResult, boxCount: 20 };
      prisma.productionResult.findUnique.mockResolvedValue(mockResultWithPlan);
      prisma.productionResult.update.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch('/production-plans/1/result')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({ boxCount: 20 })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockProductionResult.id,
          boxCount: 20,
        }),
      );
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch('/production-plans/1/result')
        .send({ boxCount: 20 })
        .expect(401);
    });
  });

  describe('DELETE /production-plans/:planId/result', () => {
    it('should delete production result', async () => {
      prisma.productionResult.findUnique.mockResolvedValue(mockProductionResult);
      prisma.productionResult.delete.mockResolvedValue(mockProductionResult);

      await request(app.getHttpServer())
        .delete('/production-plans/1/result')
        .set('Authorization', `Bearer ${workerToken}`)
        .expect(200);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete('/production-plans/1/result')
        .expect(401);
    });
  });
});
