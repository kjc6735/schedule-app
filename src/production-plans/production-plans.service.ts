import { Injectable } from '@nestjs/common';
import { paginate } from 'src/common/dto/paginated-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
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
      },
    });
  }

  async getProductionPlans({ take, page }: PaginationDto, date?: Date) {
    const skip = (page - 1) * take;

    const data = await this.prisma.productionPlan.findMany({
      where: date
        ? {
            productionDate: date,
          }
        : undefined,
      include: {
        product: true,
        packagingSpec: true,
      },
      skip,
      take: take + 1,
    });

    return paginate(data, take);
  }

  async deleteProductionPlan(id: ProductionPlanId) {
    return this.prisma.productionPlan.delete({
      where: { id },
    });
  }
}
