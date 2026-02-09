import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  createTestApp,
  createAccessToken,
  adminPayload,
} from './helpers/e2e-setup';
import { MockPrismaService } from './helpers/mock-prisma';
import { mockProduct, mockPackagingSpec } from './helpers/fixtures';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: MockPrismaService;
  let jwtService: JwtService;
  let adminToken: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    jwtService = testApp.jwtService;
    adminToken = await createAccessToken(jwtService, adminPayload);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /products', () => {
    it('should create product when admin', async () => {
      prisma.product.create.mockResolvedValue(mockProduct);

      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '새제품',
          packagingSpecs: [{ name: '소포장', gramPerPack: 500 }],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({ name: '새제품', packagingSpecs: [] })
        .expect(401);
    });
  });

  describe('GET /products', () => {
    it('should return products list', async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);

      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /products/:productId', () => {
    it('should return product by id', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const response = await request(app.getHttpServer())
        .get('/products/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('name');
    });
  });

  describe('DELETE /products/:productId', () => {
    it('should delete product when admin', async () => {
      prisma.product.delete.mockResolvedValue(mockProduct);

      await request(app.getHttpServer())
        .delete('/products/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('POST /products/:productId/packaging-specs', () => {
    it('should create packaging spec', async () => {
      prisma.packagingSpec.create.mockResolvedValue(mockPackagingSpec);

      const response = await request(app.getHttpServer())
        .post('/products/1/packaging-specs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '소포장', gramPerPack: 500 })
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /products/:productId/packaging-specs', () => {
    it('should return packaging specs for product', async () => {
      prisma.packagingSpec.findMany.mockResolvedValue([mockPackagingSpec]);

      const response = await request(app.getHttpServer())
        .get('/products/1/packaging-specs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
