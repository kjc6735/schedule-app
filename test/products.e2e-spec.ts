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

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockProduct.id,
          name: mockProduct.name,
        }),
      );
    });

    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .send({ name: '새제품', packagingSpecs: [] })
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: 401,
        }),
      );
    });
  });

  describe('GET /products', () => {
    it('should return products list', async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);

      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.hasNext).toBe(false);
      expect(response.body.data[0]).toEqual(
        expect.objectContaining({
          id: mockProduct.id,
          name: mockProduct.name,
        }),
      );
    });
  });

  describe('GET /products/:productId', () => {
    it('should return product by id', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const response = await request(app.getHttpServer())
        .get('/products/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockProduct.id,
          name: mockProduct.name,
        }),
      );
    });
  });

  describe('PATCH /products/:productId', () => {
    it('should update product when admin', async () => {
      const updated = { ...mockProduct, name: '수정됨' };
      prisma.product.update.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .patch('/products/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '수정됨' })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockProduct.id,
          name: '수정됨',
        }),
      );
    });
  });

  describe('DELETE /products/:productId', () => {
    it('should delete product when admin', async () => {
      prisma.product.delete.mockResolvedValue(mockProduct);

      const response = await request(app.getHttpServer())
        .delete('/products/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockProduct.id,
          name: mockProduct.name,
        }),
      );
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

      expect(response.body).toEqual(
        expect.objectContaining({
          id: mockPackagingSpec.id,
          name: mockPackagingSpec.name,
          gramPerPack: mockPackagingSpec.gramPerPack,
        }),
      );
    });
  });

  describe('GET /products/:productId/packaging-specs', () => {
    it('should return packaging specs for product', async () => {
      prisma.packagingSpec.findMany.mockResolvedValue([mockPackagingSpec]);

      const response = await request(app.getHttpServer())
        .get('/products/1/packaging-specs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          id: mockPackagingSpec.id,
          name: mockPackagingSpec.name,
          gramPerPack: mockPackagingSpec.gramPerPack,
        }),
      );
    });
  });
});
