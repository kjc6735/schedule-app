import { Module } from '@nestjs/common';
import { PackagingSpecsService } from './packaging-specs.service';
import { PackagingSpecsController } from './packaging-specs.controller';

@Module({
  providers: [PackagingSpecsService],
  controllers: [PackagingSpecsController],
  exports: [PackagingSpecsService],
})
export class PackagingSpecsModule {}
