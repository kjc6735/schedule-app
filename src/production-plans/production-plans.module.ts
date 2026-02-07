import { Module } from '@nestjs/common';
import { ProductionPlansService } from './production-plans.service';
import { ProductionPlansController } from './production-plans.controller';

@Module({
  providers: [ProductionPlansService],
  controllers: [ProductionPlansController]
})
export class ProductionPlansModule {}
