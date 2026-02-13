import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Admin } from 'src/common/decorator/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePackagingSpecRequestDto } from 'src/packaging-specs/dto/create-packaging-spec.request.dto';
import { PackagingSpecsService } from 'src/packaging-specs/packaging-specs.service';
import { CreateProductRequestDto } from './dto/create-product.request.dto';
import { UpdateProductRequestDto } from './dto/update-product.request.dto';
import { ProductsService } from './products.service';

@ApiTags('제품')
@ApiBearerAuth('access-token')
@Controller('products')
@Admin()
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly packagingSpecsService: PackagingSpecsService,
  ) {}

  @Post()
  @ApiOperation({ summary: '제품 생성 (포장 규격 포함)' })
  @ApiResponse({ status: 201, description: '제품 생성 성공' })
  @ApiResponse({
    status: 401,
    description: '인증 실패 또는 권한 없음 (관리자만 가능)',
  })
  createProduct(@Body() createProductRequestDto: CreateProductRequestDto) {
    return this.productsService.createProduct(createProductRequestDto);
  }

  @Get(':productId')
  @ApiOperation({ summary: '제품 단건 조회' })
  @ApiParam({ name: 'productId', description: '제품 ID', example: 1 })
  @ApiResponse({ status: 200, description: '제품 정보 (포장 규격 포함)' })
  @ApiResponse({
    status: 401,
    description: '인증 실패 또는 권한 없음 (관리자만 가능)',
  })
  async getProductWithPackagingSpecs(@Param('productId') productId: number) {
    return this.productsService.getProductWithPackagingSpecs(productId);
  }

  @Get()
  @ApiOperation({ summary: '제품 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '제품 목록 (포장 규격 포함)',
    schema: {
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        hasNext: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 또는 권한 없음 (관리자만 가능)',
  })
  async getProducts(@Query() pagination: PaginationDto) {
    return this.productsService.getProductsWithPackagingSpecs(pagination);
  }

  @Patch(':productId')
  @ApiOperation({ summary: '제품 수정' })
  @ApiParam({ name: 'productId', description: '제품 ID', example: 1 })
  @ApiResponse({ status: 200, description: '제품 수정 성공' })
  @ApiResponse({
    status: 401,
    description: '인증 실패 또는 권한 없음 (관리자만 가능)',
  })
  @ApiResponse({ status: 404, description: '제품을 찾을 수 없음' })
  async updateProduct(
    @Param('productId') productId: number,
    @Body() dto: UpdateProductRequestDto,
  ) {
    return this.productsService.updateProduct(productId, dto);
  }

  @Delete(':productId')
  @ApiOperation({ summary: '제품 삭제' })
  @ApiParam({ name: 'productId', description: '제품 ID', example: 1 })
  @ApiResponse({ status: 200, description: '제품 삭제 성공' })
  @ApiResponse({
    status: 401,
    description: '인증 실패 또는 권한 없음 (관리자만 가능)',
  })
  @ApiResponse({ status: 404, description: '제품을 찾을 수 없음' })
  async deleteProduct(@Param('productId') productId: number) {
    return this.productsService.deleteProduct(productId);
  }

  @Post(':productId/packaging-specs')
  @ApiOperation({ summary: '제품에 포장 규격 추가' })
  @ApiParam({ name: 'productId', description: '제품 ID', example: 1 })
  @ApiResponse({ status: 201, description: '포장 규격 생성 성공' })
  @ApiResponse({ status: 400, description: '참조하는 제품이 존재하지 않음' })
  @ApiResponse({
    status: 401,
    description: '인증 실패 또는 권한 없음 (관리자만 가능)',
  })
  async createPackagingSpec(
    @Param('productId') productId: number,
    @Body() dto: CreatePackagingSpecRequestDto,
  ) {
    return this.packagingSpecsService.createPackagingSpec(productId, dto);
  }

  @Get(':productId/packaging-specs')
  @ApiOperation({ summary: '제품의 포장 규격 목록 조회' })
  @ApiParam({ name: 'productId', description: '제품 ID', example: 1 })
  @ApiResponse({ status: 200, description: '포장 규격 목록' })
  @ApiResponse({
    status: 401,
    description: '인증 실패 또는 권한 없음 (관리자만 가능)',
  })
  async getPackagingSpecs(@Param('productId') productId: number) {
    return this.packagingSpecsService.getPackagingSpecsByProductId(productId);
  }
}
