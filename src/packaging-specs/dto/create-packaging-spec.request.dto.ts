import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePackagingSpecRequestDto {
  @ApiProperty({ description: '규격명', example: '500g 소포장' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '팩당 그램수', example: 500 })
  @IsNumber()
  gramPerPack: number;
}
