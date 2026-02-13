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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DateRagneQueryDto } from 'src/common/dto/date-range.query.dto';
import { JwtPayload } from 'src/types/jwt';
import { AuthUser } from 'src/users/decorator/auth.user.decorator';
import { CreateLeaveRequestDto } from './dto/create-leave.request.dto';
import { UpdateLeaveByOwnerRequestDto } from './dto/update-leave-by-owner.request.dto';
import { UpdateLeaveStatusByAdminRequestDto } from './dto/update-leave-status-by-admin.request.dto';
import { LeavesService } from './leaves.service';

@ApiTags('휴가')
@ApiBearerAuth('access-token')
@Controller('leaves')
export class LeavesController {
  constructor(private readonly leaveService: LeavesService) {}

  @Post()
  @ApiOperation({ summary: '휴가 생성' })
  @ApiResponse({ status: 201, description: '휴가 생성 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async createLeave(
    @AuthUser() user: JwtPayload,
    @Body() createLeaveRequestDto: CreateLeaveRequestDto,
  ) {
    const { sub } = user;
    return this.leaveService.createLeave({
      userId: sub,
      ...createLeaveRequestDto,
    });
  }

  @Get(':leaveId')
  @ApiOperation({ summary: '휴가 단건 조회' })
  @ApiParam({ name: 'leaveId', description: '휴가 ID', example: 1 })
  @ApiResponse({ status: 200, description: '휴가 정보' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async findLeaveById(@Param('leaveId') leaveId: number) {
    return this.leaveService.findLeaveById(leaveId);
  }

  @Get()
  @ApiOperation({ summary: '기간별 휴가 목록 조회' })
  @ApiResponse({ status: 200, description: '휴가 목록' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async findLeavesByDateRange(@Query() dateRangeQueryDto: DateRagneQueryDto) {
    return this.leaveService.findLeavesByDateRange(dateRangeQueryDto);
  }

  @Patch(':leaveId/status')
  @ApiOperation({ summary: '휴가 승인/거절 (관리자)' })
  @ApiParam({ name: 'leaveId', description: '휴가 ID', example: 1 })
  @ApiResponse({ status: 200, description: '휴가 상태 변경 성공' })
  @ApiResponse({ status: 401, description: '인증 실패 또는 수정 권한 없음' })
  @ApiResponse({ status: 404, description: '유저 또는 휴가를 찾을 수 없음' })
  async updateStatusByAdmin(
    @Param('leaveId') leaveId: number,
    @AuthUser() user: JwtPayload,
    @Body() body: UpdateLeaveStatusByAdminRequestDto,
  ) {
    return this.leaveService.updateStatusByAdmin(user.sub, leaveId, body);
  }

  @Patch(':leaveId')
  @ApiOperation({ summary: '본인 휴가 수정' })
  @ApiParam({ name: 'leaveId', description: '휴가 ID', example: 1 })
  @ApiResponse({ status: 200, description: '휴가 수정 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '휴가를 찾을 수 없음' })
  async updateLeaveByUser(
    @Param('leaveId') leaveId: number,
    @AuthUser() user: JwtPayload,
    @Body() body: UpdateLeaveByOwnerRequestDto,
  ) {
    return this.leaveService.updateLeaveByUser(user.sub, leaveId, body);
  }

  @Delete(':leaveId')
  @ApiOperation({ summary: '휴가 삭제 (본인 또는 관리자)' })
  @ApiParam({ name: 'leaveId', description: '휴가 ID', example: 1 })
  @ApiResponse({ status: 200, description: '휴가 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패 또는 삭제 권한 없음' })
  @ApiResponse({ status: 404, description: '유저 또는 휴가를 찾을 수 없음' })
  async deleteLeave(
    @Param('leaveId') leaveId: number,
    @AuthUser() user: JwtPayload,
  ) {
    return this.leaveService.deleteLeave(user.sub, leaveId);
  }
}
