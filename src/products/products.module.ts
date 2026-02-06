import { Module } from '@nestjs/common';
import { PackagingSpecsModule } from 'src/packaging-specs/packaging-specs.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [PackagingSpecsModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
