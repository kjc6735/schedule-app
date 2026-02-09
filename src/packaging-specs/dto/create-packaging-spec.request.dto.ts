import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePackagingSpecRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  gramPerPack: number;
}
