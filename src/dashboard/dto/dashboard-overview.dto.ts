import { ApiProperty } from '@nestjs/swagger';

export class DashboardOverviewDto {
  @ApiProperty({ example: 42 })
  totalLearners!: number;

  @ApiProperty({ example: 6, description: 'Modules with at least one learner assigned' })
  activeModules!: number;

  @ApiProperty({ example: 71.5, description: 'Completed module attempts as a percentage of total assignments' })
  overallCompletionRate!: number;

  @ApiProperty({ example: 82.3, description: 'Average percentage score across all completed module attempts' })
  averageScore!: number;
}
