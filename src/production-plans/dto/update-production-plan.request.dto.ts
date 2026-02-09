import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductionPlanRequestDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  productionDate?: Date;

  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsOptional()
  @IsNumber()
  packagingSpecId?: number;

  @IsOptional()
  @IsNumber()
  targetAmountGram?: number;

  @IsOptional()
  @IsNumber()
  resultAmountGram?: number | null;

  @IsOptional()
  @IsNumber()
  resultPackCount?: number | null;

  @IsOptional()
  @IsString()
  memo?: string | null;
}
