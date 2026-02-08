import { LeaveApproveStatus } from 'generated/prisma/enums';

export class UpdateLeaveStatusByAdminRequestDto {
  status: LeaveApproveStatus;
}
