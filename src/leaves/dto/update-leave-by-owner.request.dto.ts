import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { LeaveType } from 'generated/prisma/enums';

export class UpdateLeaveByOwnerRequestDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date | undefined;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date | undefined;

  @IsOptional()
  @IsString()
  reason?: string | null | undefined;

  @IsOptional()
  @IsEnum(LeaveType)
  leaveType?: LeaveType | undefined;
}
