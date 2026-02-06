import { Test, TestingModule } from '@nestjs/testing';
import { PackagingSpecsService } from './packaging-specs.service';

describe('PackagingSpecsService', () => {
  let service: PackagingSpecsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PackagingSpecsService],
    }).compile();

    service = module.get<PackagingSpecsService>(PackagingSpecsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
