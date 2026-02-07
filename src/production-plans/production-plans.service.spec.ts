import { Test, TestingModule } from '@nestjs/testing';
import { ProductionPlansService } from './production-plans.service';

describe('ProductionPlansService', () => {
  let service: ProductionPlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductionPlansService],
    }).compile();

    service = module.get<ProductionPlansService>(ProductionPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
