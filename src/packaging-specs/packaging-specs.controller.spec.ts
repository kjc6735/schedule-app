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
    it('should call service.updatePackagingSpec with id and dto', async () => {
      service.updatePackagingSpec.mockResolvedValue(mockPackagingSpec);

      await controller.updatePackagingSpec(1, { name: '대포장' });

      expect(service.updatePackagingSpec).toHaveBeenCalledWith(1, {
        name: '대포장',
      });
    });
  });

  describe('deletePackagingSpec', () => {
    it('should call service.deletePackagingSpec with id', async () => {
      service.deletePackagingSpec.mockResolvedValue(mockPackagingSpec);

      await controller.deletePackagingSpec(1);

      expect(service.deletePackagingSpec).toHaveBeenCalledWith(1);
    });
  });

  describe('getPackagingSpec', () => {
    it('should call service.getPackagingSpec with id', async () => {
      service.getPackagingSpec.mockResolvedValue(mockPackagingSpec);

      await controller.getPackagingSpec(1);

      expect(service.getPackagingSpec).toHaveBeenCalledWith(1);
    });
  });
});
