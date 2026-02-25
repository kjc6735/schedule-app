import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { mockProductionPlan } from '../../test/helpers/fixtures';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test/helpers/mock-prisma';
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

      const result = await service.updateProductionPlan(1, {
        resultAmountGram: 9500,
      });

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
          productionResult: true,
        },
      });
      expect(result).toEqual(mockProductionPlan);
    });
  });

  describe('getProductionPlans', () => {
    it('should query without date filter when dateRange is omitted', async () => {
      prisma.productionPlan.findMany.mockResolvedValue([mockProductionPlan]);

      const result = await service.getProductionPlans({});

      expect(prisma.productionPlan.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { product: true, packagingSpec: true, productionResult: true },
      });
      expect(result).toEqual([mockProductionPlan]);
    });

    it('should query with date range filter when start and end are provided', async () => {
      const start = new Date('2026-02-01');
      const end = new Date('2026-02-28');
      prisma.productionPlan.findMany.mockResolvedValue([mockProductionPlan]);

      const result = await service.getProductionPlans({ start, end });

      expect(prisma.productionPlan.findMany).toHaveBeenCalledWith({
        where: { productionDate: { gte: start, lte: end } },
        include: { product: true, packagingSpec: true, productionResult: true },
      });
      expect(result).toEqual([mockProductionPlan]);
    });

    it('should return empty array when no plans exist', async () => {
      prisma.productionPlan.findMany.mockResolvedValue([]);

      const result = await service.getProductionPlans({});

      expect(result).toEqual([]);
    });

    it('should return all plans without pagination', async () => {
      const items = Array.from({ length: 25 }, () => mockProductionPlan);
      prisma.productionPlan.findMany.mockResolvedValue(items);

      const result = await service.getProductionPlans({});

      expect(result).toHaveLength(25);
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
