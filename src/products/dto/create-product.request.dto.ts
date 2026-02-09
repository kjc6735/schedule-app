import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreatePackagingSpec {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  gramPerPack: number;
}

export class CreateProductRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePackagingSpec)
  packagingSpecs: CreatePackagingSpec[];
}
