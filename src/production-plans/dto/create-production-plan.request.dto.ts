export class CreateProductionPlanRequestDto {
  productionDate: Date;
  productId: number;
  packagingSpecId: number;
  targetAmountGram: number;
  memo: string | null = null;
}
