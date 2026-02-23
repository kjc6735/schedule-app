import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateProductionResultRequestDto {
  @ApiProperty({ description: '박스 수', example: 10 })
  @IsNumber()
  boxCount: number;

  @ApiProperty({ description: '박스당 팩 수', example: 5 })
  @IsNumber()
  packsPerBox: number;

  @ApiProperty({ description: '나머지 팩 수', example: 3 })
  @IsNumber()
  remainingPackCount: number;
}
