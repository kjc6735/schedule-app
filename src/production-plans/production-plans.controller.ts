import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Admin } from 'src/common/decorator/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateProductionPlanRequestDto } from './dto/create-production-plan.request.dto';
import { UpdateProductionPlanRequestDto } from './dto/update-production-plan.request.dto';
import { ProductionPlansService } from './production-plans.service';

@ApiTags('생산 계획')
@ApiBearerAuth('access-token')
@Controller('production-plans')
export class ProductionPlansController {
  constructor(
    private readonly productionPlansService: ProductionPlansService,
  ) {}

  @Post()
  @Admin()
  @ApiOperation({ summary: '생산 계획 생성 (관리자)' })
  @ApiResponse({ status: 201, description: '생산 계획 생성 성공' })
  @ApiResponse({ status: 400, description: '참조하는 데이터가 존재하지 않음 (제품/규격)' })
  @ApiResponse({ status: 401, description: '인증 실패 또는 권한 없음 (관리자만 가능)' })
  createProductionPlan(
    @Body() dto: CreateProductionPlanRequestDto,
    @Req() req: Request,
  ) {
    const createdById = req.user!.sub;
    return this.productionPlansService.createProductionPlan(dto, createdById);
  }

  @Patch(':id')
  @Admin()
  @ApiOperation({ summary: '생산 계획 수정 (관리자)' })
  @ApiParam({ name: 'id', description: '생산 계획 ID', example: 1 })
  @ApiResponse({ status: 200, description: '생산 계획 수정 성공' })
  @ApiResponse({ status: 400, description: '참조하는 데이터가 존재하지 않음 (제품/규격)' })
  @ApiResponse({ status: 401, description: '인증 실패 또는 권한 없음 (관리자만 가능)' })
  @ApiResponse({ status: 404, description: '생산 계획을 찾을 수 없음' })
  updateProductionPlan(
    @Param('id') id: number,
    @Body() dto: UpdateProductionPlanRequestDto,
  ) {
    return this.productionPlansService.updateProductionPlan(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '생산 계획 단건 조회 (제품/규격 포함)' })
  @ApiParam({ name: 'id', description: '생산 계획 ID', example: 1 })
  @ApiResponse({ status: 200, description: '생산 계획 정보 (제품, 포장 규격 포함)' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  getProductionPlan(@Param('id') id: number) {
    return this.productionPlansService.getProductionPlan(id);
  }

  @Get()
  @ApiOperation({ summary: '생산 계획 목록 조회 (날짜 필터 가능)' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: '생산일 필터 (ISO 8601)',
    example: '2025-01-15T00:00:00.000Z',
  })
  @ApiResponse({
    status: 200,
    description: '생산 계획 목록 (제품, 포장 규격 포함)',
    schema: {
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        hasNext: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  getProductionPlans(
    @Query() pagination: PaginationDto,
    @Query('date') date?: Date,
  ) {
    return this.productionPlansService.getProductionPlans(pagination, date);
  }

  @Delete(':id')
  @Admin()
  @ApiOperation({ summary: '생산 계획 삭제 (관리자)' })
  @ApiParam({ name: 'id', description: '생산 계획 ID', example: 1 })
  @ApiResponse({ status: 200, description: '생산 계획 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패 또는 권한 없음 (관리자만 가능)' })
  @ApiResponse({ status: 404, description: '생산 계획을 찾을 수 없음' })
  deleteProductionPlan(@Param('id') id: number) {
    return this.productionPlansService.deleteProductionPlan(id);
  }
}
