import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, ScenarioCategory } from '@prisma/client';

export class LearnerResponseDto {
  @ApiProperty({ example: 12 })
  id!: number;

  @ApiProperty({ example: 'jane.doe' })
  username!: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  email!: string;

  @ApiProperty({ example: 'Jane' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ enum: Role, example: Role.LEARNER })
  role!: Role;

  @ApiPropertyOptional({ type: Number, example: 3, nullable: true })
  organisationId!: number | null;

  @ApiProperty({
    example: 62,
    description:
      'Percentage of this learner\'s assigned training modules that are complete',
  })
  progressPercentage!: number;

  @ApiPropertyOptional({
    type: Number,
    example: 78,
    nullable: true,
    description:
      'Average score across the learner\'s finalized module attempts, null if they have none yet',
  })
  averageScore!: number | null;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-08-22T12:14:00.000Z',
    nullable: true,
    description:
      'Most recent scenario-attempt activity, null if the learner has never started anything',
  })
  lastActiveAt!: string | null;

  @ApiProperty({
    enum: ScenarioCategory,
    isArray: true,
    example: [ScenarioCategory.VISHING, ScenarioCategory.WHALING],
    description:
      'Scenario categories this learner scores worst in, weakest first. Empty if they have no attempts yet',
  })
  weaknesses!: ScenarioCategory[];
}
