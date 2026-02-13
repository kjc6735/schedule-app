import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveType } from 'generated/prisma/enums';

export class CreateLeaveRequestDto {
  @ApiProperty({ description: '시작일', example: '2025-01-20T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: '종료일', example: '2025-01-22T00:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({ description: '사유', example: '개인 사유', nullable: true })
  @IsOptional()
  @IsString()
  reason: string | null;

  @ApiProperty({ description: '휴가 유형', enum: LeaveType, example: 'annual' })
  @IsEnum(LeaveType)
  leaveType: LeaveType;
}
