import { Test, TestingModule } from '@nestjs/testing';
import { PackagingSpecsController } from './packaging-specs.controller';

describe('PackagingSpecsController', () => {
  let controller: PackagingSpecsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackagingSpecsController],
    }).compile();

    controller = module.get<PackagingSpecsController>(PackagingSpecsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
