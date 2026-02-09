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
import { mockLeave, mockAdminUser, mockUser } from './helpers/fixtures';

describe('Leaves (e2e)', () => {
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

  describe('GET /leaves/:leaveId', () => {
    it('should return leave by id', async () => {
      prisma.leave.findUnique.mockResolvedValue(mockLeave);

      const response = await request(app.getHttpServer())
        .get('/leaves/1')
        .set('Authorization', `Bearer ${workerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/leaves/1').expect(401);
    });
  });

  describe('GET /leaves', () => {
    it('should return leaves by date range', async () => {
      prisma.leave.findMany.mockResolvedValue([mockLeave]);

      const response = await request(app.getHttpServer())
        .get('/leaves')
        .query({ start: '20260201', end: '20260228' })
        .set('Authorization', `Bearer ${workerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PATCH /leaves/:leaveId/status', () => {
    it('should update status when admin', async () => {
      prisma.user.findUnique.mockResolvedValue(mockAdminUser);
      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      prisma.leave.update.mockResolvedValue({
        ...mockLeave,
        status: 'approved',
      });

      await request(app.getHttpServer())
        .patch('/leaves/1/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' })
        .expect(200);
    });

    it('should return 401 when worker tries to update status', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.leave.findUnique.mockResolvedValue(mockLeave);

      await request(app.getHttpServer())
        .patch('/leaves/1/status')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({ status: 'approved' })
        .expect(401);
    });
  });

  describe('PATCH /leaves/:leaveId', () => {
    it('should update leave by user', async () => {
      prisma.leave.update.mockResolvedValue(mockLeave);

      await request(app.getHttpServer())
        .patch('/leaves/1')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({ reason: '변경사유' })
        .expect(200);
    });
  });

  describe('DELETE /leaves/:leaveId', () => {
    it('should delete leave when owner', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      prisma.leave.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/leaves/1')
        .set('Authorization', `Bearer ${workerToken}`)
        .expect(200);
    });

    it('should delete leave when admin', async () => {
      prisma.user.findUnique.mockResolvedValue(mockAdminUser);
      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      prisma.leave.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/leaves/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).delete('/leaves/1').expect(401);
    });
  });
});
