import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DateRagneQueryDto } from 'src/common/dto/date-range.query.dto';
import { JwtPayload } from 'src/types/jwt';
import { AuthUser } from 'src/users/decorator/auth.user.decorator';
import { UpdateLeaveByOwnerRequestDto } from './dto/update-leave-by-owner.request.dto';
import { UpdateLeaveStatusByAdminRequestDto } from './dto/update-leave-status-by-admin.request.dto';
import { LeavesService } from './leaves.service';

@Controller('leaves')
export class LeavesController {
  constructor(private readonly leaveService: LeavesService) {}

  @Post()
  async createLeave() {}

  @Get(':leaveId')
  async findLeaveById(@Param('leaveId') leaveId: number) {
    return this.leaveService.findLeaveById(leaveId);
  }

  @Get()
  async findLeavesByDateRange(@Query() dateRangeQueryDto: DateRagneQueryDto) {
    return this.leaveService.findLeavesByDateRange(dateRangeQueryDto);
  }

  @Patch(':leaveId/status')
  async updateStatusByAdmin(
    @Param('leaveId') leaveId: number,
    @AuthUser() user: JwtPayload,
    @Body() body: UpdateLeaveStatusByAdminRequestDto,
  ) {
    return this.leaveService.updateStatusByAdmin(user.sub, leaveId, body);
  }

  @Patch(':leaveId')
  async updateLeaveByUser(
    @Param('leaveId') leaveId: number,
    @AuthUser() user: JwtPayload,
    @Body() body: UpdateLeaveByOwnerRequestDto,
  ) {
    return this.leaveService.updateLeaveByUser(user.sub, leaveId, body);
  }

  @Delete(':leaveId')
  async deleteLeave(
    @Param('leaveId') leaveId: number,
    @AuthUser() user: JwtPayload,
  ) {
    return this.leaveService.deleteLeave(user.sub, leaveId);
  }
}
