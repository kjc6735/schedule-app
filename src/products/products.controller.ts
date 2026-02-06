import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Admin } from 'src/common/decorator/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagenation.dto';
import { CreatePackagingSpecRequestDto } from 'src/packaging-specs/dto/create-packaging-spec.request.dto';
import { PackagingSpecsService } from 'src/packaging-specs/packaging-specs.service';
import { CreateProductRequestDto } from './dto/create-product.request.dto';
import { ProductsService } from './products.service';

@Controller('products')
@Admin()
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly packagingSpecsService: PackagingSpecsService,
  ) {}

  @Post()
  createProduct(@Body() createProductRequestDto: CreateProductRequestDto) {
    return this.productsService.createProduct(createProductRequestDto);
  }

  @Get(':productId')
  async getProductWithPackagingSpecs(@Param('productId') productId: number) {
    return this.productsService.getProductWithPackagingSpecs(productId);
  }

  @Get()
  async getProducts(@Query() pagination: PaginationDto) {
    return this.productsService.getProducts(pagination);
  }

  @Delete(':productId')
  async deleteProduct(@Param('productId') productId: number) {
    return this.productsService.deleteProduct(productId);
  }

  @Post(':productId/packaging-specs')
  async createPackagingSpec(
    @Param('productId') productId: number,
    @Body() dto: CreatePackagingSpecRequestDto,
  ) {
    return this.packagingSpecsService.createPackagingSpec(productId, dto);
  }

  @Get(':productId/packaging-specs')
  async getPackagingSpecs(@Param('productId') productId: number) {
    return this.packagingSpecsService.getPackagingSpecsByProductId(productId);
  }
}
