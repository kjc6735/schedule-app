import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Gender, Role } from 'generated/prisma/enums';

export class RegisterRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirm: string;

  @IsEnum(Gender)
  gender: 'male' | 'female';

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
