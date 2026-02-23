import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CreateProductionResultRequestDto } from './dto/create-production-result.request.dto';
import { UpdateProductionResultRequestDto } from './dto/update-production-result.request.dto';
import { ProductionResultsService } from './production-results.service';

@ApiTags('생산 계획')
@ApiBearerAuth('access-token')
@Controller('production-plans')
export class ProductionResultsController {
  constructor(
    private readonly productionResultsService: ProductionResultsService,
  ) {}

  @Post(':planId/result')
  @ApiOperation({ summary: '생산 결과 입력 (인증 필요)' })
  @ApiParam({ name: 'planId', description: '생산 계획 ID', example: 1 })
  @ApiResponse({ status: 201, description: '생산 결과 입력 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '생산 계획을 찾을 수 없음' })
  createProductionResult(
    @Param('planId') planId: number,
    @Body() dto: CreateProductionResultRequestDto,
    @Req() req: Request,
  ) {
    const createdById = req.user!.sub;
    return this.productionResultsService.createProductionResult(
      planId,
      dto,
      createdById,
    );
  }

  @Get(':planId/result')
  @ApiOperation({ summary: '생산 결과 조회' })
  @ApiParam({ name: 'planId', description: '생산 계획 ID', example: 1 })
  @ApiResponse({ status: 200, description: '생산 결과 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  getProductionResult(@Param('planId') planId: number) {
    return this.productionResultsService.getProductionResult(planId);
  }

  @Patch(':planId/result')
  @ApiOperation({ summary: '생산 결과 수정 (인증 필요)' })
  @ApiParam({ name: 'planId', description: '생산 계획 ID', example: 1 })
  @ApiResponse({ status: 200, description: '생산 결과 수정 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '생산 결과를 찾을 수 없음' })
  updateProductionResult(
    @Param('planId') planId: number,
    @Body() dto: UpdateProductionResultRequestDto,
  ) {
    return this.productionResultsService.updateProductionResult(planId, dto);
  }

  @Delete(':planId/result')
  @ApiOperation({ summary: '생산 결과 삭제 (인증 필요)' })
  @ApiParam({ name: 'planId', description: '생산 계획 ID', example: 1 })
  @ApiResponse({ status: 200, description: '생산 결과 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '생산 결과를 찾을 수 없음' })
  deleteProductionResult(@Param('planId') planId: number) {
    return this.productionResultsService.deleteProductionResult(planId);
  }
}
