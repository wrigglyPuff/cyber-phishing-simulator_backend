import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class ModuleResultModuleDto {
  @ApiProperty({ example: 4 })
  id!: number;

  @ApiProperty({ example: 'Spotting Phishing Emails' })
  title!: string;
}

export class ModuleResultSummaryDto {
  @ApiProperty({ example: 21 })
  id!: number;

  @ApiProperty({ example: 12 })
  userId!: number;

  @ApiProperty({ example: 4 })
  moduleId!: number;

  @ApiProperty({ example: 3 })
  organisationId!: number;

  @ApiProperty({ enum: Status, example: Status.COMPLETED })
  status!: Status;

  @ApiProperty({ example: 2 })
  total_score!: number;

  @ApiProperty({ example: 3 })
  max_possible_score!: number;

  @ApiProperty({ example: 67 })
  percentage_score!: number;

  @ApiProperty({ example: 3 })
  scenarios_completed!: number;

  @ApiProperty({ example: 3 })
  total_scenarios!: number;

  @ApiProperty({ example: false })
  passed!: boolean;

  @ApiProperty({ example: '' })
  feedback!: string;

  @ApiProperty({ example: '2026-08-22T12:00:00.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true, example: '2026-08-22T12:00:00.000Z' })
  startedAt!: Date | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true, example: '2026-08-22T12:14:00.000Z' })
  completedAt!: Date | null;

  @ApiProperty({ example: '2026-08-22T12:14:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: ModuleResultModuleDto })
  module!: ModuleResultModuleDto;
}

export class ScenarioResultScenarioDto {
  @ApiProperty({ example: 9 })
  id!: number;

  @ApiProperty({ example: 'Suspicious Password Reset Email' })
  title!: string;

  @ApiProperty({ example: 4 })
  moduleId!: number;
}

export class ScenarioResultSummaryDto {
  @ApiProperty({ example: 55 })
  id!: number;

  @ApiProperty({ example: 21 })
  moduleResultId!: number;

  @ApiProperty({ example: 9 })
  scenarioId!: number;

  @ApiProperty({ example: 4 })
  moduleId!: number;

  @ApiProperty({ example: true })
  isCorrect!: boolean;

  @ApiProperty({ example: 45 })
  timeTakenSeconds!: number;

  @ApiProperty({ example: 1 })
  attemptNumber!: number;

  @ApiProperty({ example: 'suspicious' })
  response!: string;

  @ApiProperty({ example: 100 })
  score!: number;

  @ApiProperty({ example: '2026-08-22T12:14:00.000Z' })
  startedAt!: Date;

  @ApiProperty({ example: '2026-08-22T12:14:45.000Z' })
  completedAt!: Date;

  @ApiPropertyOptional({ type: Number, nullable: true, example: null })
  selectedChoice!: number | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: null })
  selectedChoiceText!: string | null;

  @ApiProperty({ example: '2026-08-22T12:14:45.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({
    type: [String],
    nullable: true,
    example: ['Dear user', 'no reply-micr0soft'],
    description: 'Cues the learner selected as suspicious',
  })
  cueSelections!: unknown;

  @ApiPropertyOptional({
    type: [String],
    nullable: true,
    example: [],
    description: 'Cues the learner failed to select',
  })
  missedCues!: unknown;

  @ApiProperty({ type: ScenarioResultScenarioDto })
  scenario!: ScenarioResultScenarioDto;
}

export class LearnerResultsSummaryDto {
  @ApiProperty({ type: [ModuleResultSummaryDto] })
  moduleResults!: ModuleResultSummaryDto[];

  @ApiProperty({ type: [ScenarioResultSummaryDto] })
  scenarioResults!: ScenarioResultSummaryDto[];
}
