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
import { Request } from 'express';
import { Admin } from 'src/common/decorator/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagenation.dto';
import { CreateProductionPlanRequestDto } from './dto/create-production-plan.request.dto';
import { UpdateProductionPlanRequestDto } from './dto/update-production-plan.request.dto';
import { ProductionPlansService } from './production-plans.service';

@Controller('production-plans')
export class ProductionPlansController {
  constructor(
    private readonly productionPlansService: ProductionPlansService,
  ) {}

  @Post()
  @Admin()
  createProductionPlan(
    @Body() dto: CreateProductionPlanRequestDto,
    @Req() req: Request,
  ) {
    const createdById = req.user!.sub;
    return this.productionPlansService.createProductionPlan(dto, createdById);
  }

  @Patch(':id')
  @Admin()
  updateProductionPlan(
    @Param('id') id: number,
    @Body() dto: UpdateProductionPlanRequestDto,
  ) {
    return this.productionPlansService.updateProductionPlan(id, dto);
  }

  @Get(':id')
  getProductionPlan(@Param('id') id: number) {
    return this.productionPlansService.getProductionPlan(id);
  }

  @Get()
  getProductionPlans(
    @Query() pagination: PaginationDto,
    @Query('date') date?: Date,
  ) {
    return this.productionPlansService.getProductionPlans(pagination, date);
  }

  @Delete(':id')
  @Admin()
  deleteProductionPlan(@Param('id') id: number) {
    return this.productionPlansService.deleteProductionPlan(id);
  }
}
