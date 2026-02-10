import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test/helpers/mock-prisma';
import { mockProductionPlan } from '../../test/helpers/fixtures';
import { ProductionPlansService } from './production-plans.service';

describe('ProductionPlansService', () => {
  let service: ProductionPlansService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionPlansService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductionPlansService>(ProductionPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProductionPlan', () => {
    it('should create production plan with createdById', async () => {
      const dto = {
        productionDate: new Date('2026-02-01'),
        productId: 1,
        packagingSpecId: 1,
        targetAmountGram: 10000,
        memo: '메모',
      };
      prisma.productionPlan.create.mockResolvedValue({
        ...mockProductionPlan,
      });

      const result = await service.createProductionPlan(dto, 2);

      expect(prisma.productionPlan.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          createdById: 2,
        },
      });
      expect(result).toEqual(mockProductionPlan);
    });
  });

  describe('updateProductionPlan', () => {
    it('should update production plan by id', async () => {
      const updated = { ...mockProductionPlan, resultAmountGram: 9500 };
      prisma.productionPlan.update.mockResolvedValue(updated);

      const result = await service.updateProductionPlan(1, { resultAmountGram: 9500 });

      expect(prisma.productionPlan.update).toHaveBeenCalledWith({
        data: { resultAmountGram: 9500 },
        where: { id: 1 },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('getProductionPlan', () => {
    it('should find production plan with product and packagingSpec', async () => {
      prisma.productionPlan.findUnique.mockResolvedValue(mockProductionPlan);

      const result = await service.getProductionPlan(1);

      expect(prisma.productionPlan.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          product: true,
          packagingSpec: true,
        },
      });
      expect(result).toEqual(mockProductionPlan);
    });
  });

  describe('getProductionPlans', () => {
    it('should query without date filter when date is undefined', async () => {
      prisma.productionPlan.findMany.mockResolvedValue([mockProductionPlan]);

      const result = await service.getProductionPlans({ page: 1, take: 20 });

      expect(prisma.productionPlan.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { product: true, packagingSpec: true },
        skip: 0,
        take: 21,
      });
      expect(result).toEqual([mockProductionPlan]);
    });

    it('should query with date filter when date is provided', async () => {
      const date = new Date('2026-02-01');
      prisma.productionPlan.findMany.mockResolvedValue([mockProductionPlan]);

      const result = await service.getProductionPlans({ page: 1, take: 20 }, date);

      expect(prisma.productionPlan.findMany).toHaveBeenCalledWith({
        where: { productionDate: date },
        include: { product: true, packagingSpec: true },
        skip: 0,
        take: 21,
      });
      expect(result).toEqual([mockProductionPlan]);
    });

    it('should calculate pagination correctly', async () => {
      prisma.productionPlan.findMany.mockResolvedValue([]);

      const result = await service.getProductionPlans({ page: 3, take: 10 });

      expect(prisma.productionPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 11,
        }),
      );
      expect(result).toEqual([]);
    });
  });

  describe('deleteProductionPlan', () => {
    it('should delete production plan by id', async () => {
      prisma.productionPlan.delete.mockResolvedValue(mockProductionPlan);

      const result = await service.deleteProductionPlan(1);

      expect(prisma.productionPlan.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockProductionPlan);
    });
  });
});
