import { Test, TestingModule } from '@nestjs/testing';
import { mockProductionResult } from '../../test/helpers/fixtures';
import { ProductionResultsController } from './production-results.controller';
import { ProductionResultsService } from './production-results.service';

describe('ProductionResultsController', () => {
  let controller: ProductionResultsController;
  let service: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    service = {
      createProductionResult: vi.fn(),
      getProductionResult: vi.fn(),
      updateProductionResult: vi.fn(),
      deleteProductionResult: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionResultsController],
      providers: [{ provide: ProductionResultsService, useValue: service }],
    }).compile();

    controller = module.get<ProductionResultsController>(
      ProductionResultsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProductionResult', () => {
    it('should call service with planId, dto, createdById from req.user', async () => {
      service.createProductionResult.mockResolvedValue(mockProductionResult);
      const dto = { boxCount: 10, packsPerBox: 5, remainingPackCount: 3 };
      const req = { user: { sub: 1 } } as any;

      const result = await controller.createProductionResult(1, dto as any, req);

      expect(service.createProductionResult).toHaveBeenCalledWith(1, dto, 1);
      expect(result).toEqual(mockProductionResult);
    });
  });

  describe('getProductionResult', () => {
    it('should call service with planId and return result', async () => {
      service.getProductionResult.mockResolvedValue(mockProductionResult);

      const result = await controller.getProductionResult(1);

      expect(service.getProductionResult).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProductionResult);
    });
  });

  describe('updateProductionResult', () => {
    it('should call service with planId and dto', async () => {
      const updated = { ...mockProductionResult, boxCount: 20 };
      service.updateProductionResult.mockResolvedValue(updated);

      const result = await controller.updateProductionResult(1, { boxCount: 20 } as any);

      expect(service.updateProductionResult).toHaveBeenCalledWith(1, { boxCount: 20 });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteProductionResult', () => {
    it('should call service with planId and return result', async () => {
      service.deleteProductionResult.mockResolvedValue(mockProductionResult);

      const result = await controller.deleteProductionResult(1);

      expect(service.deleteProductionResult).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProductionResult);
    });
  });
});
