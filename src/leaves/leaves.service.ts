import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'generated/prisma/browser';
import { LeaveApproveStatus } from 'generated/prisma/enums';
import { isAdmin } from 'src/common/utils/is-admin';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateLeave,
  LeaveId,
  UpdateLeaveByAdmin,
  UpdateLeaveByUser,
} from 'src/types/leave';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LeavesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createLeave(data: CreateLeave) {
    // todo: 계산 넣어야함.
    return this.prisma.leave.create({
      data: {
        ...data,
        status: LeaveApproveStatus.requested,
        totalDays: 0,
      },
    });
  }

  async updateStatusByAdmin(
    adminId: User['id'],
    leaveId: LeaveId,
    data: UpdateLeaveByAdmin,
  ) {
    const user = await this.usersService.getUser({ id: adminId });
    const leave = await this.findLeaveById(leaveId);
    if (!user) throw new NotFoundException('존재하지 않는 유저입니다.');
    if (!leave) throw new NotFoundException('존재하지 않는 휴가 기록입니다.');
    if (!isAdmin(user.role))
      throw new UnauthorizedException('수정 권한이 없습니다.');
    return this.prisma.leave.update({
      where: {
        id: leaveId,
      },
      data,
    });
  }

  async updateLeaveByUser(
    userId: User['id'],
    leaveId: LeaveId,
    data: UpdateLeaveByUser,
  ) {
    return this.prisma.leave.update({
      where: {
        id: leaveId,
        userId,
      },
      data,
    });
  }

  async deleteLeave(userId: User['id'], leaveId: LeaveId) {
    const user = await this.usersService.getUser({ id: userId });
    const leave = await this.findLeaveById(leaveId);
    if (!user) throw new NotFoundException('존재하지 않는 유저입니다.');
    if (!leave) throw new NotFoundException('존재하지 않는 휴가 기록입니다.');

    const isOwner = leave.userId === userId;
    if (!isAdmin(user.role) && !isOwner)
      throw new UnauthorizedException('수정 권한이 없습니다.');

    await this.prisma.leave.delete({
      where: {
        id: leaveId,
      },
    });
  }

  async findLeaveById(id: LeaveId) {
    return this.prisma.leave.findUnique({
      where: {
        id,
      },
    });
  }

  async findLeavesByDateRange({ start, end }: { start: Date; end: Date }) {
    return this.prisma.leave.findMany({
      where: {
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });
  }
}
