import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PaginationDto } from 'src/common/dto/pagenation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProduct, ProductId, UpdateProduct } from 'src/types/product';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct({ name, packagingSpecs }: CreateProduct) {
    await this.prisma.product.create({
      data: {
        name,
        packagingSpecs: {
          createMany: {
            data: packagingSpecs,
          },
        },
      },
    });
  }

  async updateProduct(id: ProductId, { name }: UpdateProduct) {
    try {
      return await this.prisma.product.update({
        data: { name },
        where: { id },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('상품을 찾을 수 없습니다.');
      }
      throw e;
    }
  }

  async getProductWithPackagingSpecs(productId: ProductId) {
    return this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });
  }

  async getProduct(id: ProductId) {
    return this.prisma.product.findUnique({
      where: { id: id },
    });
  }

  async getProducts({ take, page }: PaginationDto) {
    const skip = (page - 1) * take;

    return this.prisma.product.findMany({
      skip: skip,
      take: take + 1,
    });
  }

  async deleteProduct(id: ProductId) {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('상품을 찾을 수 없습니다.');
      }
      throw e;
    }
  }
}
