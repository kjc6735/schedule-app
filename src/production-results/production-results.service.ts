import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductionResultRequestDto } from './dto/create-production-result.request.dto';
import { UpdateProductionResultRequestDto } from './dto/update-production-result.request.dto';

@Injectable()
export class ProductionResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProductionResult(
    planId: number,
    dto: CreateProductionResultRequestDto,
    createdById: number,
  ) {
    const plan = await this.prisma.productionPlan.findUnique({
      where: { id: planId },
      include: { packagingSpec: true },
    });
    if (!plan) throw new NotFoundException('생산 계획을 찾을 수 없습니다.');

    const totalPackCount =
      dto.boxCount * dto.packsPerBox + dto.remainingPackCount;
    const totalAmountGram = totalPackCount * plan.packagingSpec.gramPerPack;

    return this.prisma.productionResult.create({
      data: {
        productionPlanId: planId,
        boxCount: dto.boxCount,
        packsPerBox: dto.packsPerBox,
        remainingPackCount: dto.remainingPackCount,
        totalPackCount,
        totalAmountGram,
        createdById,
      },
    });
  }

  async getProductionResult(planId: number) {
    return this.prisma.productionResult.findUnique({
      where: { productionPlanId: planId },
    });
  }

  async updateProductionResult(
    planId: number,
    dto: UpdateProductionResultRequestDto,
  ) {
    const existing = await this.prisma.productionResult.findUnique({
      where: { productionPlanId: planId },
      include: { productionPlan: { include: { packagingSpec: true } } },
    });
    if (!existing) throw new NotFoundException('생산 결과를 찾을 수 없습니다.');

    const boxCount = dto.boxCount ?? existing.boxCount;
    const packsPerBox = dto.packsPerBox ?? existing.packsPerBox;
    const remainingPackCount =
      dto.remainingPackCount ?? existing.remainingPackCount;
    const totalPackCount = boxCount * packsPerBox + remainingPackCount;
    const totalAmountGram =
      totalPackCount * existing.productionPlan.packagingSpec.gramPerPack;

    return this.prisma.productionResult.update({
      where: { productionPlanId: planId },
      data: {
        boxCount,
        packsPerBox,
        remainingPackCount,
        totalPackCount,
        totalAmountGram,
      },
    });
  }

  async deleteProductionResult(planId: number) {
    const existing = await this.prisma.productionResult.findUnique({
      where: { productionPlanId: planId },
    });
    if (!existing) throw new NotFoundException('생산 결과를 찾을 수 없습니다.');

    return this.prisma.productionResult.delete({
      where: { productionPlanId: planId },
    });
  }
}
