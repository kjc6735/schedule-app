import { ProductionResult } from 'generated/prisma/client';

type CreateProductionResultField =
  | 'boxCount'
  | 'packsPerBox'
  | 'remainingPackCount'
  | 'totalPackCount'
  | 'totalAmountGram';

type UpdateProductionResultField =
  | 'boxCount'
  | 'packsPerBox'
  | 'remainingPackCount'
  | 'totalPackCount'
  | 'totalAmountGram';

export type CreateProductionResult = Pick<
  ProductionResult,
  CreateProductionResultField
>;
export type UpdateProductionResult = Partial<
  Pick<ProductionResult, UpdateProductionResultField>
>;
export type ProductionResultId = ProductionResult['id'];
