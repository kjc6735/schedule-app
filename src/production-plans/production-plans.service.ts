import { Injectable } from '@nestjs/common';
import { DateRagneQueryDto } from 'src/common/dto/date-range.query.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateProductionPlan,
  ProductionPlanId,
  UpdateProductionPlan,
} from 'src/types/production-plan';

@Injectable()
export class ProductionPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async createProductionPlan(data: CreateProductionPlan, createdById: number) {
    return this.prisma.productionPlan.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  async updateProductionPlan(id: ProductionPlanId, data: UpdateProductionPlan) {
    return this.prisma.productionPlan.update({
      data,
      where: { id },
    });
  }

  async getProductionPlan(id: ProductionPlanId) {
    return this.prisma.productionPlan.findUnique({
      where: { id },
      include: {
        product: true,
        packagingSpec: true,
        productionResult: true,
      },
    });
  }

  async getProductionPlans(
    // { take, page }: PaginationDto,
    { start, end }: DateRagneQueryDto = {},
  ) {
    // const skip = (page - 1) * take;

    const data = await this.prisma.productionPlan.findMany({
      where:
        start && end ? { productionDate: { gte: start, lte: end } } : undefined,
      include: {
        product: true,
        packagingSpec: true,
        productionResult: true,
      },
      // skip,
      // take: take + 1,
    });

    return data; //paginate(data, take);
  }

  async deleteProductionPlan(id: ProductionPlanId) {
    return this.prisma.productionPlan.delete({
      where: { id },
    });
  }
}
