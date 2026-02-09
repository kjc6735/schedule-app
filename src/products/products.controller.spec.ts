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
    it('should call productsService.createProduct', () => {
      const dto = { name: '제품', packagingSpecs: [] };
      productsService.createProduct.mockResolvedValue(mockProduct);

      controller.createProduct(dto as any);

      expect(productsService.createProduct).toHaveBeenCalledWith(dto);
    });
  });

  describe('getProductWithPackagingSpecs', () => {
    it('should call productsService.getProductWithPackagingSpecs', async () => {
      productsService.getProductWithPackagingSpecs.mockResolvedValue(
        mockProduct,
      );

      await controller.getProductWithPackagingSpecs(1);

      expect(
        productsService.getProductWithPackagingSpecs,
      ).toHaveBeenCalledWith(1);
    });
  });

  describe('getProducts', () => {
    it('should call productsService.getProducts with pagination', async () => {
      productsService.getProducts.mockResolvedValue([mockProduct]);

      await controller.getProducts({ page: 1, take: 20 });

      expect(productsService.getProducts).toHaveBeenCalledWith({
        page: 1,
        take: 20,
      });
    });
  });

  describe('deleteProduct', () => {
    it('should call productsService.deleteProduct', async () => {
      productsService.deleteProduct.mockResolvedValue(mockProduct);

      await controller.deleteProduct(1);

      expect(productsService.deleteProduct).toHaveBeenCalledWith(1);
    });
  });

  describe('createPackagingSpec', () => {
    it('should call packagingSpecsService.createPackagingSpec', async () => {
      packagingSpecsService.createPackagingSpec.mockResolvedValue(
        mockPackagingSpec,
      );
      const dto = { name: '소포장', gramPerPack: 500 };

      await controller.createPackagingSpec(1, dto);

      expect(packagingSpecsService.createPackagingSpec).toHaveBeenCalledWith(
        1,
        dto,
      );
    });
  });

  describe('getPackagingSpecs', () => {
    it('should call packagingSpecsService.getPackagingSpecsByProductId', async () => {
      packagingSpecsService.getPackagingSpecsByProductId.mockResolvedValue([
        mockPackagingSpec,
      ]);

      await controller.getPackagingSpecs(1);

      expect(
        packagingSpecsService.getPackagingSpecsByProductId,
      ).toHaveBeenCalledWith(1);
    });
  });
});
