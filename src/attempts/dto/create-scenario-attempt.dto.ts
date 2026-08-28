import { IsInt, IsString, IsOptional, IsNotEmpty, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScenarioAttemptDto {
  @ApiProperty({ example: 1, description: 'The scenario being answered' })
  @IsInt()
  @IsNotEmpty()
  scenarioId!: number;


  @ApiProperty({ example: 2, description: 'The module this scenario belongs to' })
  @IsInt()
  @IsNotEmpty()
  moduleId!: number;

  @ApiProperty({ example: 3, description: 'Which attempt number this is for this scenario' })
  @IsInt()
  @IsNotEmpty()
  attemptNumber!: number;

  @ApiProperty({ example: 'suspicious', description: "The learner's answer" })
  @IsString()
  @IsNotEmpty()
  response!: string;

  @ApiPropertyOptional({ example: 350, description: 'The time taken in seconds to select an answer for this scenario' })
  @IsInt()
  @IsOptional()
  timeTakenSeconds!: number;

  @ApiProperty({ example: '2026-07-22T12:14:00Z', description: 'When the learner opens this scenario' })
  @IsDateString()
  @IsNotEmpty()
  startedAt!: string;

  @ApiProperty({ example: '2026-08-22T12:14:00Z', description: 'When the learner submits their answer' })
  @IsDateString()
  @IsNotEmpty()
  completedAt!: string;

  @ApiProperty({ example: ["Dear user", "no reply-micr0soft"], description: "The text cue the learner identified as suspicious" })
  @IsString()
  @IsOptional()
  selectedCues?: string[];
}
