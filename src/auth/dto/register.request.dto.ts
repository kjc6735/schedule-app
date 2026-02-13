import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Gender, Role } from 'generated/prisma/enums';

export class RegisterRequestDto {
  @ApiProperty({ description: '이름', example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '비밀번호', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: '비밀번호 확인', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  passwordConfirm: string;

  @ApiProperty({ description: '성별', enum: ['male', 'female'], example: 'male' })
  @IsEnum(Gender)
  gender: 'male' | 'female';

  @ApiProperty({ description: '휴대폰 번호', example: '01012345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: '역할', enum: Role, example: 'worker' })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ description: '사용자 아이디', example: 'john123' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
