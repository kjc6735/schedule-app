import { IsEnum } from 'class-validator';
import { LeaveApproveStatus } from 'generated/prisma/enums';

export class UpdateLeaveStatusByAdminRequestDto {
  @IsEnum(LeaveApproveStatus)
  status: LeaveApproveStatus;
}
