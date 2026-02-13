import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { LeaveApproveStatus } from 'generated/prisma/enums';

export class UpdateLeaveStatusByAdminRequestDto {
  @ApiProperty({
    description: '승인 상태',
    enum: LeaveApproveStatus,
    example: 'approved',
  })
  @IsEnum(LeaveApproveStatus)
  status: LeaveApproveStatus;
}
