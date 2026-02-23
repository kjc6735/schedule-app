import { Module } from '@nestjs/common';
import { ProductionPlansController } from './production-plans.controller';
import { ProductionPlansService } from './production-plans.service';

@Module({
  providers: [ProductionPlansService],
  controllers: [ProductionPlansController],
})
export class ProductionPlansModule {}
