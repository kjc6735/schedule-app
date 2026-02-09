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

      await service.createProductionPlan(dto, 2);

      expect(prisma.productionPlan.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          createdById: 2,
        },
      });
    });
  });

  describe('updateProductionPlan', () => {
    it('should update production plan by id', async () => {
      prisma.productionPlan.update.mockResolvedValue(mockProductionPlan);

      await service.updateProductionPlan(1, { resultAmountGram: 9500 });

      expect(prisma.productionPlan.update).toHaveBeenCalledWith({
        data: { resultAmountGram: 9500 },
        where: { id: 1 },
      });
    });
  });

  describe('getProductionPlan', () => {
    it('should find production plan with product and packagingSpec', async () => {
      prisma.productionPlan.findUnique.mockResolvedValue(mockProductionPlan);

      await service.getProductionPlan(1);

      expect(prisma.productionPlan.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          product: true,
          packagingSpec: true,
        },
      });
    });
  });

  describe('getProductionPlans', () => {
    it('should query without date filter when date is undefined', async () => {
      prisma.productionPlan.findMany.mockResolvedValue([mockProductionPlan]);

      await service.getProductionPlans({ page: 1, take: 20 });

      expect(prisma.productionPlan.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { product: true, packagingSpec: true },
        skip: 0,
        take: 21,
      });
    });

    it('should query with date filter when date is provided', async () => {
      const date = new Date('2026-02-01');
      prisma.productionPlan.findMany.mockResolvedValue([mockProductionPlan]);

      await service.getProductionPlans({ page: 1, take: 20 }, date);

      expect(prisma.productionPlan.findMany).toHaveBeenCalledWith({
        where: { productionDate: date },
        include: { product: true, packagingSpec: true },
        skip: 0,
        take: 21,
      });
    });

    it('should calculate pagination correctly', async () => {
      prisma.productionPlan.findMany.mockResolvedValue([]);

      await service.getProductionPlans({ page: 3, take: 10 });

      expect(prisma.productionPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 11,
        }),
      );
    });
  });

  describe('deleteProductionPlan', () => {
    it('should delete production plan by id', async () => {
      prisma.productionPlan.delete.mockResolvedValue(mockProductionPlan);

      await service.deleteProductionPlan(1);

      expect(prisma.productionPlan.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
