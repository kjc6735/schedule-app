import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveType } from 'generated/prisma/enums';

export class UpdateLeaveByOwnerRequestDto {
  @ApiPropertyOptional({ description: '시작일', example: '2025-01-20T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date | undefined;

  @ApiPropertyOptional({ description: '종료일', example: '2025-01-22T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date | undefined;

  @ApiPropertyOptional({ description: '사유', example: '개인 사유', nullable: true })
  @IsOptional()
  @IsString()
  reason?: string | null | undefined;

  @ApiPropertyOptional({
    description: '휴가 유형',
    enum: LeaveType,
    example: 'annual',
  })
  @IsOptional()
  @IsEnum(LeaveType)
  leaveType?: LeaveType | undefined;
}
