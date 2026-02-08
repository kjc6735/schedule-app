import { LeaveType } from 'generated/prisma/enums';

export class UpdateLeaveByOwnerRequestDto {
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  reason?: string | null | undefined;
  leaveType?: LeaveType | undefined;
}
