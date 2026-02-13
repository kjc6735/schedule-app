import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ description: '페이지 번호', default: 1, example: 1 })
  @Type(() => Number)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    description: '페이지당 항목 수',
    default: 20,
    example: 20,
  })
  @Type(() => Number)
  @IsOptional()
  take: number = 20;
}
