import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { paginate } from 'src/common/dto/paginated-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
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
      include: {
        packagingSpecs: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  async getProduct(id: ProductId) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async getProducts({ take, page }: PaginationDto) {
    const skip = (page - 1) * take;

    const data = await this.prisma.product.findMany({
      skip,
      take: take + 1,
      where: {
        deletedAt: null,
      },
    });

    return paginate(data, take);
  }

  async getProductsWithPackagingSpecs({ take, page }: PaginationDto) {
    const skip = (page - 1) * take;

    const data = await this.prisma.product.findMany({
      skip,
      take: take + 1,
      where: { deletedAt: null },
      include: {
        packagingSpecs: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    return paginate(data, take);
  }

  async deleteProduct(id: ProductId) {
    const product = await this.getProduct(id);
    if (!product) throw new BadRequestException('존재하지 않는 상품입니다.');

    const deletedAt = new Date();
    try {
      await this.prisma.$transaction([
        this.prisma.product.update({
          where: {
            id,
          },
          data: {
            deletedAt,
          },
        }),
        this.prisma.packagingSpec.updateMany({
          where: {
            productId: product.id,
          },
          data: {
            deletedAt,
          },
        }),
      ]);
    } catch (e) {
      throw new InternalServerErrorException('다시 시도해주세요.');
    }
  }
}
