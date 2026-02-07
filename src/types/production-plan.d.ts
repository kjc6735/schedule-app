import { ProductionPlan } from 'generated/prisma/client';

type CreateProductionPlanField =
  | 'productionDate'
  | 'productId'
  | 'packagingSpecId'
  | 'targetAmountGram'
  | 'memo';

type UpdateProductionPlanField =
  | 'productionDate'
  | 'productId'
  | 'packagingSpecId'
  | 'targetAmountGram'
  | 'resultAmountGram'
  | 'resultPackCount'
  | 'memo';

export type CreateProductionPlan = Pick<
  ProductionPlan,
  CreateProductionPlanField
>;
export type UpdateProductionPlan = Partial<
  Pick<ProductionPlan, UpdateProductionPlanField>
>;
export type ProductionPlanId = ProductionPlan['id'];
