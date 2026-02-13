import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductionPlanRequestDto {
  @ApiPropertyOptional({ description: '생산일', example: '2025-01-15T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  productionDate?: Date;

  @ApiPropertyOptional({ description: '제품 ID', example: 1 })
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: '포장 규격 ID', example: 1 })
  @IsOptional()
  @IsNumber()
  packagingSpecId?: number;

  @ApiPropertyOptional({ description: '목표 생산량 (g)', example: 10000 })
  @IsOptional()
  @IsNumber()
  targetAmountGram?: number;

  @ApiPropertyOptional({ description: '실제 생산량 (g)', example: 9500, nullable: true })
  @IsOptional()
  @IsNumber()
  resultAmountGram?: number | null;

  @ApiPropertyOptional({ description: '실제 팩 수', example: 5, nullable: true })
  @IsOptional()
  @IsNumber()
  resultPackCount?: number | null;

  @ApiPropertyOptional({ description: '비고', example: '오전 생산분', nullable: true })
  @IsOptional()
  @IsString()
  memo?: string | null;
}
