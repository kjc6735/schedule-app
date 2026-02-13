import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProductRequestDto {
  @ApiPropertyOptional({ description: '제품명', example: '막창' })
  @IsOptional()
  @IsString()
  name?: string;
}
