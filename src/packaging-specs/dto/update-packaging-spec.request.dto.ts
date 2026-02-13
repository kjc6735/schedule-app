import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePackagingSpecRequestDto {
  @ApiPropertyOptional({ description: '규격명', example: '1kg 팩' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '팩당 그램수', example: 1000 })
  @IsOptional()
  @IsNumber()
  gramPerPack?: number;
}
