import { IsOptional, IsString } from 'class-validator';

export class UpdateProductRequestDto {
  @IsOptional()
  @IsString()
  name?: string;
}
