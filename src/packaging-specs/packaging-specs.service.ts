import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
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
    try {
      return await this.prisma.packagingSpec.update({
        data,
        where: { id },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('포장규격을 찾을 수 없습니다.');
      }
      throw e;
    }
  }

  async deletePackagingSpec(id: PackagingSpecId) {
    try {
      await this.prisma.packagingSpec.delete({
        where: { id },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('포장규격을 찾을 수 없습니다.');
      }
      throw e;
    }
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
