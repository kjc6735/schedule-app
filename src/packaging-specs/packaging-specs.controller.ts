import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Admin } from 'src/common/decorator/roles.decorator';
import { UpdatePackagingSpecRequestDto } from './dto/update-packaging-spec.request.dto';
import { PackagingSpecsService } from './packaging-specs.service';

@ApiTags('포장 규격')
@ApiBearerAuth('access-token')
@Controller('packaging-specs')
@Admin()
export class PackagingSpecsController {
  constructor(private readonly packagingSpecsService: PackagingSpecsService) {}

  @Patch(':id')
  @ApiOperation({ summary: '포장 규격 수정' })
  @ApiParam({ name: 'id', description: '포장 규격 ID', example: 1 })
  @ApiResponse({ status: 200, description: '포장 규격 수정 성공' })
  @ApiResponse({ status: 401, description: '인증 실패 또는 권한 없음 (관리자만 가능)' })
  @ApiResponse({ status: 404, description: '포장 규격을 찾을 수 없음' })
  async updatePackagingSpec(
    @Param('id') id: number,
    @Body() dto: UpdatePackagingSpecRequestDto,
  ) {
    return this.packagingSpecsService.updatePackagingSpec(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '포장 규격 삭제' })
  @ApiParam({ name: 'id', description: '포장 규격 ID', example: 1 })
  @ApiResponse({ status: 200, description: '포장 규격 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패 또는 권한 없음 (관리자만 가능)' })
  @ApiResponse({ status: 404, description: '포장 규격을 찾을 수 없음' })
  async deletePackagingSpec(@Param('id') id: number) {
    return this.packagingSpecsService.deletePackagingSpec(id);
  }

  @Get(':id')
  @ApiOperation({ summary: '포장 규격 단건 조회' })
  @ApiParam({ name: 'id', description: '포장 규격 ID', example: 1 })
  @ApiResponse({ status: 200, description: '포장 규격 정보' })
  @ApiResponse({ status: 401, description: '인증 실패 또는 권한 없음 (관리자만 가능)' })
  async getPackagingSpec(@Param('id') id: number) {
    return this.packagingSpecsService.getPackagingSpec(id);
  }
}
