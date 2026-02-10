import { Test, TestingModule } from '@nestjs/testing';
import { ProductionPlansController } from './production-plans.controller';
import { ProductionPlansService } from './production-plans.service';
import { mockProductionPlan } from '../../test/helpers/fixtures';

describe('ProductionPlansController', () => {
  let controller: ProductionPlansController;
  let service: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    service = {
      createProductionPlan: vi.fn(),
      updateProductionPlan: vi.fn(),
      getProductionPlan: vi.fn(),
      getProductionPlans: vi.fn(),
      deleteProductionPlan: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionPlansController],
      providers: [{ provide: ProductionPlansService, useValue: service }],
    }).compile();

    controller = module.get<ProductionPlansController>(
      ProductionPlansController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProductionPlan', () => {
    it('should call service.createProductionPlan and return result', async () => {
      service.createProductionPlan.mockResolvedValue(mockProductionPlan);
      const dto = {
        productionDate: new Date('2026-02-01'),
        productId: 1,
        packagingSpecId: 1,
        targetAmountGram: 10000,
        memo: '메모',
      };
      const req = { user: { sub: 2 } } as any;

      const result = await controller.createProductionPlan(dto as any, req);

      expect(service.createProductionPlan).toHaveBeenCalledWith(dto, 2);
      expect(result).toEqual(mockProductionPlan);
    });
  });

  describe('updateProductionPlan', () => {
    it('should call service.updateProductionPlan and return result', async () => {
      const updated = { ...mockProductionPlan, resultAmountGram: 9500 };
      service.updateProductionPlan.mockResolvedValue(updated);

      const result = await controller.updateProductionPlan(1, { resultAmountGram: 9500 } as any);

      expect(service.updateProductionPlan).toHaveBeenCalledWith(1, {
        resultAmountGram: 9500,
      });
      expect(result).toEqual(updated);
    });
  });

  describe('getProductionPlan', () => {
    it('should call service.getProductionPlan and return result', async () => {
      service.getProductionPlan.mockResolvedValue(mockProductionPlan);

      const result = await controller.getProductionPlan(1);

      expect(service.getProductionPlan).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProductionPlan);
    });
  });

  describe('getProductionPlans', () => {
    it('should call service.getProductionPlans and return result', async () => {
      service.getProductionPlans.mockResolvedValue([mockProductionPlan]);
      const date = new Date('2026-02-01');

      const result = await controller.getProductionPlans({ page: 1, take: 20 }, date);

      expect(service.getProductionPlans).toHaveBeenCalledWith(
        { page: 1, take: 20 },
        date,
      );
      expect(result).toEqual([mockProductionPlan]);
    });
  });

  describe('deleteProductionPlan', () => {
    it('should call service.deleteProductionPlan and return result', async () => {
      service.deleteProductionPlan.mockResolvedValue(mockProductionPlan);

      const result = await controller.deleteProductionPlan(1);

      expect(service.deleteProductionPlan).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProductionPlan);
    });
  });
});
