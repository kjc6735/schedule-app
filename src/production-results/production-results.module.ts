import { Module } from '@nestjs/common';
import { ProductionResultsController } from './production-results.controller';
import { ProductionResultsService } from './production-results.service';

@Module({
  providers: [ProductionResultsService],
  controllers: [ProductionResultsController],
})
export class ProductionResultsModule {}
