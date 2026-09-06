import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class ModuleResultUserDto {
  @ApiProperty({ example: 12 })
  id!: number;

  @ApiProperty({ example: 'jane.doe' })
  username!: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  email!: string;
}

export class ModuleResultRowDto {
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

  @ApiProperty({ type: ModuleResultUserDto })
  user!: ModuleResultUserDto;
}

export class ModuleResultsSummaryDto {
  @ApiProperty({ example: 4 })
  moduleId!: number;

  @ApiProperty({ example: 18, description: 'Number of learners with a result row for this module' })
  completions!: number;

  @ApiProperty({ example: 74 })
  averageScorePercent!: number;

  @ApiProperty({ type: [ModuleResultRowDto] })
  results!: ModuleResultRowDto[];
}
