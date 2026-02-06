import { PackagingSpec, Product } from 'generated/prisma/client';

type CreateProductField = 'name';
type CreatePackagingSpecField = 'name' | 'gramPerPack';

type UpdateProductField = 'name';
type UpdatePackagingSpecField = 'name' | 'gramPerPack';

export type CreatePackagingSpec = Pick<PackagingSpec, CreatePackagingSpecField>;

export type CreateProduct = Pick<Product, CreateProductField> & {
  packagingSpecs: CreatePackagingSpec[];
};

export type UpdateProduct = Partial<Pick<Product, UpdateProductField>>;

export type UpdatePackagingSpec = Partial<
  Pick<PackagingSpec, UpdatePackagingSpecField>
>;

// 1개 업데이트
export type UpdatePackagingSpecWithId = UpdatePackagingSpec &
  Readonly<Pick<PackagingSpec, 'id'>>;

export type ProductId = Product['id'];
export type PackagingSpecId = PackagingSpec['id'];
