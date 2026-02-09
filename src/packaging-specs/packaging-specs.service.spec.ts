import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test/helpers/mock-prisma';
import { mockPackagingSpec } from '../../test/helpers/fixtures';
import { PackagingSpecsService } from './packaging-specs.service';

describe('PackagingSpecsService', () => {
  let service: PackagingSpecsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagingSpecsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PackagingSpecsService>(PackagingSpecsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPackagingSpec', () => {
    it('should create packaging spec with productId', async () => {
      prisma.packagingSpec.create.mockResolvedValue(mockPackagingSpec);

      await service.createPackagingSpec(1, {
        name: '소포장',
        gramPerPack: 500,
      });

      expect(prisma.packagingSpec.create).toHaveBeenCalledWith({
        data: {
          name: '소포장',
          gramPerPack: 500,
          productId: 1,
        },
      });
    });
  });

  describe('updatePackagingSpec', () => {
    it('should update packaging spec by id', async () => {
      prisma.packagingSpec.update.mockResolvedValue({
        ...mockPackagingSpec,
        name: '대포장',
      });

      await service.updatePackagingSpec(1, { name: '대포장' });

      expect(prisma.packagingSpec.update).toHaveBeenCalledWith({
        data: { name: '대포장' },
        where: { id: 1 },
      });
    });
  });

  describe('deletePackagingSpec', () => {
    it('should delete packaging spec by id', async () => {
      prisma.packagingSpec.delete.mockResolvedValue(mockPackagingSpec);

      await service.deletePackagingSpec(1);

      expect(prisma.packagingSpec.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('getPackagingSpec', () => {
    it('should find packaging spec by id', async () => {
      prisma.packagingSpec.findUnique.mockResolvedValue(mockPackagingSpec);

      const result = await service.getPackagingSpec(1);

      expect(prisma.packagingSpec.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockPackagingSpec);
    });
  });

  describe('getPackagingSpecsByProductId', () => {
    it('should find all specs by product id', async () => {
      prisma.packagingSpec.findMany.mockResolvedValue([mockPackagingSpec]);

      const result = await service.getPackagingSpecsByProductId(1);

      expect(prisma.packagingSpec.findMany).toHaveBeenCalledWith({
        where: { productId: 1 },
      });
      expect(result).toEqual([mockPackagingSpec]);
    });
  });
});
