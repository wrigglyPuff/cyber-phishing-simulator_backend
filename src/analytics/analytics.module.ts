import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AnalyticsService],
  exports: [AnalyticsService], // Export so attempts and results can refresh it
})
export class AnalyticsModule { }