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
    it('should call service.createProductionPlan with dto and createdById', () => {
      service.createProductionPlan.mockResolvedValue(mockProductionPlan);
      const dto = {
        productionDate: new Date('2026-02-01'),
        productId: 1,
        packagingSpecId: 1,
        targetAmountGram: 10000,
        memo: '메모',
      };
      const req = { user: { sub: 2 } } as any;

      controller.createProductionPlan(dto as any, req);

      expect(service.createProductionPlan).toHaveBeenCalledWith(dto, 2);
    });
  });

  describe('updateProductionPlan', () => {
    it('should call service.updateProductionPlan with id and dto', () => {
      service.updateProductionPlan.mockResolvedValue(mockProductionPlan);

      controller.updateProductionPlan(1, { resultAmountGram: 9500 } as any);

      expect(service.updateProductionPlan).toHaveBeenCalledWith(1, {
        resultAmountGram: 9500,
      });
    });
  });

  describe('getProductionPlan', () => {
    it('should call service.getProductionPlan with id', () => {
      service.getProductionPlan.mockResolvedValue(mockProductionPlan);

      controller.getProductionPlan(1);

      expect(service.getProductionPlan).toHaveBeenCalledWith(1);
    });
  });

  describe('getProductionPlans', () => {
    it('should call service.getProductionPlans with pagination and date', () => {
      service.getProductionPlans.mockResolvedValue([mockProductionPlan]);
      const date = new Date('2026-02-01');

      controller.getProductionPlans({ page: 1, take: 20 }, date);

      expect(service.getProductionPlans).toHaveBeenCalledWith(
        { page: 1, take: 20 },
        date,
      );
    });
  });

  describe('deleteProductionPlan', () => {
    it('should call service.deleteProductionPlan with id', () => {
      service.deleteProductionPlan.mockResolvedValue(mockProductionPlan);

      controller.deleteProductionPlan(1);

      expect(service.deleteProductionPlan).toHaveBeenCalledWith(1);
    });
  });
});
