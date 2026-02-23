import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateProductionResultRequestDto {
  @ApiPropertyOptional({ description: '박스 수', example: 10 })
  @IsOptional()
  @IsNumber()
  boxCount?: number;

  @ApiPropertyOptional({ description: '박스당 팩 수', example: 5 })
  @IsOptional()
  @IsNumber()
  packsPerBox?: number;

  @ApiPropertyOptional({ description: '나머지 팩 수', example: 3 })
  @IsOptional()
  @IsNumber()
  remainingPackCount?: number;
}
