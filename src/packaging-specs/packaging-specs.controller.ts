import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { Admin } from 'src/common/decorator/roles.decorator';
import { UpdatePackagingSpecRequestDto } from './dto/update-packaging-spec.request.dto';
import { PackagingSpecsService } from './packaging-specs.service';

@Controller('packaging-specs')
@Admin()
export class PackagingSpecsController {
  constructor(private readonly packagingSpecsService: PackagingSpecsService) {}

  @Patch(':id')
  async updatePackagingSpec(
    @Param('id') id: number,
    @Body() dto: UpdatePackagingSpecRequestDto,
  ) {
    return this.packagingSpecsService.updatePackagingSpec(id, dto);
  }

  @Delete(':id')
  async deletePackagingSpec(@Param('id') id: number) {
    return this.packagingSpecsService.deletePackagingSpec(id);
  }

  @Get(':id')
  async getPackagingSpec(@Param('id') id: number) {
    return this.packagingSpecsService.getPackagingSpec(id);
  }
}
