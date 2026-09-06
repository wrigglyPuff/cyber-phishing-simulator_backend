import { ApiProperty } from '@nestjs/swagger';

export class ModuleCompletionDto {
  @ApiProperty({ example: 4 })
  moduleId!: number;

  @ApiProperty({ example: 'Spotting Phishing Emails' })
  moduleName!: string;

  @ApiProperty({
    example: 62,
    description: 'Percentage of learners assigned this module who have completed it',
  })
  completionPercentage!: number;
}

export class DashboardOverviewDto {
  @ApiProperty({ example: 42 })
  totalLearners!: number;

  @ApiProperty({ example: 6, description: 'Modules with at least one learner assigned' })
  activeModules!: number;

  @ApiProperty({ example: 71.5, description: 'Completed module attempts as a percentage of total assignments' })
  overallCompletionRate!: number;

  @ApiProperty({ example: 82.3, description: 'Average percentage score across all completed module attempts' })
  averageScore!: number;

  @ApiProperty({
    type: [ModuleCompletionDto],
    description: 'Completion rate broken down per training module in the organisation',
  })
  moduleCompletion!: ModuleCompletionDto[];
}
