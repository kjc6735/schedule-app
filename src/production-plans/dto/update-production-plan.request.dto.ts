export class UpdateProductionPlanRequestDto {
  productionDate?: Date;
  productId?: number;
  packagingSpecId?: number;
  targetAmountGram?: number;
  resultAmountGram?: number | null;
  resultPackCount?: number | null;
  memo?: string | null;
}

