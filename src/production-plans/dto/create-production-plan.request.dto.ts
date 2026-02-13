import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductionPlanRequestDto {
  @ApiProperty({ description: '생산일', example: '2025-01-15T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  productionDate: Date;

  @ApiProperty({ description: '제품 ID', example: 1 })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: '포장 규격 ID', example: 1 })
  @IsNumber()
  packagingSpecId: number;

  @ApiProperty({ description: '목표 생산량 (g)', example: 10000 })
  @IsNumber()
  targetAmountGram: number;

  @ApiPropertyOptional({ description: '비고', example: '오전 생산분', nullable: true })
  @IsOptional()
  @IsString()
  memo: string | null = null;
}
