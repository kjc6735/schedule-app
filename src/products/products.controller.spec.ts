import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PackagingSpecsService } from 'src/packaging-specs/packaging-specs.service';
import { mockProduct, mockPackagingSpec } from '../../test/helpers/fixtures';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: Record<string, ReturnType<typeof vi.fn>>;
  let packagingSpecsService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    productsService = {
      createProduct: vi.fn(),
      getProductWithPackagingSpecs: vi.fn(),
      getProducts: vi.fn(),
      getProductsWithPackagingSpecs: vi.fn(),
      deleteProduct: vi.fn(),
    };
    packagingSpecsService = {
      createPackagingSpec: vi.fn(),
      getPackagingSpecsByProductId: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: productsService },
        { provide: PackagingSpecsService, useValue: packagingSpecsService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProduct', () => {
    it('should call productsService.createProduct and return result', async () => {
      const dto = { name: '제품', packagingSpecs: [] };
      productsService.createProduct.mockResolvedValue(mockProduct);

      const result = await controller.createProduct(dto as any);

      expect(productsService.createProduct).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('getProductWithPackagingSpecs', () => {
    it('should call productsService.getProductWithPackagingSpecs and return result', async () => {
      productsService.getProductWithPackagingSpecs.mockResolvedValue(
        mockProduct,
      );

      const result = await controller.getProductWithPackagingSpecs(1);

      expect(
        productsService.getProductWithPackagingSpecs,
      ).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('getProducts', () => {
    it('should call productsService.getProductsWithPackagingSpecs and return paginated result', async () => {
      const paginated = { data: [mockProduct], hasNext: false };
      productsService.getProductsWithPackagingSpecs.mockResolvedValue(paginated);

      const result = await controller.getProducts({ page: 1, take: 20 });

      expect(productsService.getProductsWithPackagingSpecs).toHaveBeenCalledWith({
        page: 1,
        take: 20,
      });
      expect(result).toEqual(paginated);
    });
  });

  describe('deleteProduct', () => {
    it('should call productsService.deleteProduct and return result', async () => {
      productsService.deleteProduct.mockResolvedValue(mockProduct);

      const result = await controller.deleteProduct(1);

      expect(productsService.deleteProduct).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('createPackagingSpec', () => {
    it('should call packagingSpecsService.createPackagingSpec and return result', async () => {
      packagingSpecsService.createPackagingSpec.mockResolvedValue(
        mockPackagingSpec,
      );
      const dto = { name: '소포장', gramPerPack: 500 };

      const result = await controller.createPackagingSpec(1, dto);

      expect(packagingSpecsService.createPackagingSpec).toHaveBeenCalledWith(
        1,
        dto,
      );
      expect(result).toEqual(mockPackagingSpec);
    });
  });

  describe('getPackagingSpecs', () => {
    it('should call packagingSpecsService.getPackagingSpecsByProductId and return result', async () => {
      packagingSpecsService.getPackagingSpecsByProductId.mockResolvedValue([
        mockPackagingSpec,
      ]);

      const result = await controller.getPackagingSpecs(1);

      expect(
        packagingSpecsService.getPackagingSpecsByProductId,
      ).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockPackagingSpec]);
    });
  });
});
