import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePackagingSpecRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  gramPerPack?: number;
}
