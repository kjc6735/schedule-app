export class CreateProductRequestDto {
  name: string;
  packagingSpecs: CreatePackagingSpec[];
}

export class CreatePackagingSpec {
  name: string;
  gramPerPack: number;
}
