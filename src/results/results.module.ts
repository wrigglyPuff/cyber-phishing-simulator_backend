import { Module } from '@nestjs/common';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';
import { PrismaModule } from '../prisma.module';
import { ReportsModule } from '../reports/reports.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [PrismaModule, ReportsModule, AnalyticsModule],
  controllers: [ResultsController],
  providers: [ResultsService],
})
export class ResultsModule { }
