import { Transform } from 'class-transformer';
import { IsDate } from 'class-validator';

export class DateRagneQueryDto {
  @Transform(
    ({ value }: { value: string }) =>
      new Date(value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')),
  )
  @IsDate()
  start: Date;

  @Transform(
    ({ value }: { value: string }) =>
      new Date(value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')),
  )
  @IsDate()
  end: Date;
}
