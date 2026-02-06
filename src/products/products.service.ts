import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagenation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProduct, ProductId, UpdateProduct } from 'src/types/product';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct({ name, packagingSpecs }: CreateProduct) {
    return this.prisma.product.create({
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

  async updateProduct(id: ProductId, data: UpdateProduct) {
    return this.prisma.product.update({
      data,
      where: { id },
    });
  }

  async getProductWithPackagingSpecs(productId: ProductId) {
    return this.prisma.product.findUnique({
      where: { id: productId },
    });
  }

  async getProduct(id: ProductId) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async getProducts({ take, page }: PaginationDto) {
    const skip = (page - 1) * take;

    return this.prisma.product.findMany({
      skip,
      take: take + 1,
    });
  }

  async deleteProduct(id: ProductId) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
