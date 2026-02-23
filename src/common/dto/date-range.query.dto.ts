import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class DateRagneQueryDto {
  @ApiPropertyOptional({ type: String, description: '시작일 (YYYYMMDD)', example: '20250101' })
  @IsOptional()
  @Transform(
    ({ value }: { value: string }) =>
      new Date(value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')),
  )
  @IsDate()
  start?: Date;

  @ApiPropertyOptional({ type: String, description: '종료일 (YYYYMMDD)', example: '20250131' })
  @IsOptional()
  @Transform(
    ({ value }: { value: string }) =>
      new Date(value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')),
  )
  @IsDate()
  end?: Date;
}
