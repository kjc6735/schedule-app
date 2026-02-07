import { Test, TestingModule } from '@nestjs/testing';
import { ProductionPlansController } from './production-plans.controller';

describe('ProductionPlansController', () => {
  let controller: ProductionPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionPlansController],
    }).compile();

    controller = module.get<ProductionPlansController>(
      ProductionPlansController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
