import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePackagingSpec,
  PackagingSpecId,
  ProductId,
  UpdatePackagingSpec,
} from 'src/types/product';

@Injectable()
export class PackagingSpecsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPackagingSpec(productId: ProductId, data: CreatePackagingSpec) {
    return this.prisma.packagingSpec.create({
      data: {
        ...data,
        productId,
      },
    });
  }

  async updatePackagingSpec(id: PackagingSpecId, data: UpdatePackagingSpec) {
    return this.prisma.packagingSpec.update({
      data,
      where: { id },
    });
  }

  async deletePackagingSpec(id: PackagingSpecId) {
    return this.prisma.packagingSpec.delete({
      where: { id },
    });
  }

  async getPackagingSpec(id: PackagingSpecId) {
    return this.prisma.packagingSpec.findUnique({
      where: { id },
    });
  }

  async getPackagingSpecsByProductId(productId: ProductId) {
    return this.prisma.packagingSpec.findMany({
      where: { productId },
    });
  }
}
