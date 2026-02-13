import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('사용자')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: '사용자 단건 조회' })
  @ApiParam({ name: 'id', description: '사용자 ID', example: 1 })
  @ApiResponse({ status: 200, description: '사용자 정보 (비밀번호 제외)' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '유저를 찾을 수 없음' })
  async getUser(@Param('id') id: number) {
    const user = await this.usersService.getUser({ id: Number(id) });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');
    return UserDto.from(user);
  }

  @Get()
  @ApiOperation({ summary: '사용자 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 목록 (비밀번호 제외)',
    schema: {
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        hasNext: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getUsers(@Query() pagination: PaginationDto) {
    const result = await this.usersService.getUsers(pagination);

    return {
      ...result,
      data: UserDto.fromArray(result.data),
    };
  }
}
