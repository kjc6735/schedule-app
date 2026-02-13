import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate } from 'class-validator';

export class DateRagneQueryDto {
  @ApiProperty({ description: '시작일 (YYYYMMDD)', example: '20250101' })
  @Transform(
    ({ value }: { value: string }) =>
      new Date(value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')),
  )
  @IsDate()
  start: Date;

  @ApiProperty({ description: '종료일 (YYYYMMDD)', example: '20250131' })
  @Transform(
    ({ value }: { value: string }) =>
      new Date(value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')),
  )
  @IsDate()
  end: Date;
}
