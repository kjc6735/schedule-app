import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  mockPackagingSpec,
  mockProductionPlan,
  mockProductionResult,
} from '../../test/helpers/fixtures';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test/helpers/mock-prisma';
import { ProductionResultsService } from './production-results.service';

const mockPlanWithSpec = {
  ...mockProductionPlan,
  packagingSpec: mockPackagingSpec,
};

const mockResultWithPlan = {
  ...mockProductionResult,
  productionPlan: mockPlanWithSpec,
};

describe('ProductionResultsService', () => {
  let service: ProductionResultsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionResultsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductionResultsService>(ProductionResultsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProductionResult', () => {
    const dto = { boxCount: 10, packsPerBox: 5, remainingPackCount: 3 };

    it('should calculate totals and create result', async () => {
      prisma.productionPlan.findUnique.mockResolvedValue(mockPlanWithSpec);
      prisma.productionResult.create.mockResolvedValue(mockProductionResult);

      const result = await service.createProductionResult(1, dto, 1);

      // totalPackCount = 10*5+3 = 53, totalAmountGram = 53*500 = 26500
      expect(prisma.productionResult.create).toHaveBeenCalledWith({
        data: {
          productionPlanId: 1,
          boxCount: 10,
          packsPerBox: 5,
          remainingPackCount: 3,
          totalPackCount: 53,
          totalAmountGram: 26500,
          createdById: 1,
        },
      });
      expect(result).toEqual(mockProductionResult);
    });

    it('should throw NotFoundException when plan does not exist', async () => {
      prisma.productionPlan.findUnique.mockResolvedValue(null);

      await expect(service.createProductionResult(999, dto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getProductionResult', () => {
    it('should find result by productionPlanId', async () => {
      prisma.productionResult.findUnique.mockResolvedValue(
        mockProductionResult,
      );

      const result = await service.getProductionResult(1);

      expect(prisma.productionResult.findUnique).toHaveBeenCalledWith({
        where: { productionPlanId: 1 },
      });
      expect(result).toEqual(mockProductionResult);
    });
  });

  describe('updateProductionResult', () => {
    it('should recalculate totals and update result', async () => {
      prisma.productionResult.findUnique.mockResolvedValue(mockResultWithPlan);
      const updated = {
        ...mockProductionResult,
        boxCount: 20,
        totalPackCount: 103,
        totalAmountGram: 51500,
      };
      prisma.productionResult.update.mockResolvedValue(updated);

      const result = await service.updateProductionResult(1, { boxCount: 20 });

      // boxCount=20, packsPerBox=5(기존), remainingPackCount=3(기존)
      // totalPackCount = 20*5+3 = 103, totalAmountGram = 103*500 = 51500
      expect(prisma.productionResult.update).toHaveBeenCalledWith({
        where: { productionPlanId: 1 },
        data: {
          boxCount: 20,
          packsPerBox: 5,
          remainingPackCount: 3,
          totalPackCount: 103,
          totalAmountGram: 51500,
        },
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when result does not exist', async () => {
      prisma.productionResult.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProductionResult(999, { boxCount: 5 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProductionResult', () => {
    it('should delete result by productionPlanId', async () => {
      prisma.productionResult.findUnique.mockResolvedValue(
        mockProductionResult,
      );
      prisma.productionResult.delete.mockResolvedValue(mockProductionResult);

      const result = await service.deleteProductionResult(1);

      expect(prisma.productionResult.delete).toHaveBeenCalledWith({
        where: { productionPlanId: 1 },
      });
      expect(result).toEqual(mockProductionResult);
    });

    it('should throw NotFoundException when result does not exist', async () => {
      prisma.productionResult.findUnique.mockResolvedValue(null);

      await expect(service.deleteProductionResult(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
