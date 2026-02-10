import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test/helpers/mock-prisma';
import { mockProduct } from '../../test/helpers/fixtures';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create product with packaging specs using createMany', async () => {
      const dto = {
        name: '새제품',
        packagingSpecs: [{ name: '소포장', gramPerPack: 500 }],
      };
      const created = { id: 1, ...dto };
      prisma.product.create.mockResolvedValue(created);

      const result = await service.createProduct(dto);

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          name: '새제품',
          packagingSpecs: {
            createMany: {
              data: [{ name: '소포장', gramPerPack: 500 }],
            },
          },
        },
      });
      expect(result).toEqual(created);
    });
  });

  describe('updateProduct', () => {
    it('should call prisma.product.update with correct args', async () => {
      const updated = { ...mockProduct, name: '수정됨' };
      prisma.product.update.mockResolvedValue(updated);

      const result = await service.updateProduct(1, { name: '수정됨' });

      expect(prisma.product.update).toHaveBeenCalledWith({
        data: { name: '수정됨' },
        where: { id: 1 },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('getProduct', () => {
    it('should call prisma.product.findUnique with id', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.getProduct(1);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('getProductWithPackagingSpecs', () => {
    it('should call prisma.product.findUnique with productId', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.getProductWithPackagingSpecs(1);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('getProducts', () => {
    it('should calculate pagination correctly', async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.getProducts({ page: 2, take: 10 });

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 11,
      });
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('deleteProduct', () => {
    it('should call prisma.product.delete with id', async () => {
      prisma.product.delete.mockResolvedValue(mockProduct);

      const result = await service.deleteProduct(1);

      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockProduct);
    });
  });
});
