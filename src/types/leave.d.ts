import { Leave } from 'generated/prisma/client';

export type LeaveId = Leave['id'];
type CreateLeaveRequiredField =
  | 'userId'
  | 'startDate'
  | 'endDate'
  | 'leaveType';
type CreateLeaveOptionalField = 'reason';

type UpdateLeaveByUserField = 'startDate' | 'endDate' | 'reason' | 'leaveType';

type UpdateLeaveByAdminField = 'status';

export type CreateLeave = Pick<Leave, CreateLeaveRequiredField> &
  Partial<Pick<Leave, CreateLeaveOptionalField>>;

export type UpdateLeaveByUser = Partial<Pick<Leave, UpdateLeaveByUserField>>;

export type UpdateLeaveByAdmin = Pick<Leave, UpdateLeaveByAdminField>;
