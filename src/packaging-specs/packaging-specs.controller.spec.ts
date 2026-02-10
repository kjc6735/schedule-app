import { Test, TestingModule } from '@nestjs/testing';
import { PackagingSpecsController } from './packaging-specs.controller';
import { PackagingSpecsService } from './packaging-specs.service';
import { mockPackagingSpec } from '../../test/helpers/fixtures';

describe('PackagingSpecsController', () => {
  let controller: PackagingSpecsController;
  let service: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    service = {
      updatePackagingSpec: vi.fn(),
      deletePackagingSpec: vi.fn(),
      getPackagingSpec: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackagingSpecsController],
      providers: [{ provide: PackagingSpecsService, useValue: service }],
    }).compile();

    controller = module.get<PackagingSpecsController>(
      PackagingSpecsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updatePackagingSpec', () => {
    it('should call service.updatePackagingSpec and return result', async () => {
      const updated = { ...mockPackagingSpec, name: '대포장' };
      service.updatePackagingSpec.mockResolvedValue(updated);

      const result = await controller.updatePackagingSpec(1, { name: '대포장' });

      expect(service.updatePackagingSpec).toHaveBeenCalledWith(1, {
        name: '대포장',
      });
      expect(result).toEqual(updated);
    });
  });

  describe('deletePackagingSpec', () => {
    it('should call service.deletePackagingSpec and return result', async () => {
      service.deletePackagingSpec.mockResolvedValue(mockPackagingSpec);

      const result = await controller.deletePackagingSpec(1);

      expect(service.deletePackagingSpec).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPackagingSpec);
    });
  });

  describe('getPackagingSpec', () => {
    it('should call service.getPackagingSpec and return result', async () => {
      service.getPackagingSpec.mockResolvedValue(mockPackagingSpec);

      const result = await controller.getPackagingSpec(1);

      expect(service.getPackagingSpec).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPackagingSpec);
    });
  });
});
