import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductionPlanRequestDto {
  @Type(() => Date)
  @IsDate()
  productionDate: Date;

  @IsNumber()
  productId: number;

  @IsNumber()
  packagingSpecId: number;

  @IsNumber()
  targetAmountGram: number;

  @IsOptional()
  @IsString()
  memo: string | null = null;
}
