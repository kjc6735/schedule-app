import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreatePackagingSpec {
  @ApiProperty({ description: '규격명', example: '2kg 팩' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '팩당 그램수', example: 2000 })
  @IsNumber()
  gramPerPack: number;
}

export class CreateProductRequestDto {
  @ApiProperty({ description: '제품명', example: '곱창' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '포장 규격 목록',
    type: [CreatePackagingSpec],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePackagingSpec)
  packagingSpecs: CreatePackagingSpec[];
}
