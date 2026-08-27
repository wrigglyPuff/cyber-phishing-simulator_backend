import { IsInt, IsString, IsOptional, IsNotEmpty, IsArray, IsDateString, IsNumber } from 'class-validator';
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

  @IsNumber()
  @IsNotEmpty()
  timeTakenSeconds!: number;

  @IsDateString()
  @IsNotEmpty()
  startedAt: string;

  @IsDateString()
  @IsNotEmpty()
  completedAt!: string;

  @IsArray()
  @IsString()
  @IsOptional()
  selectedCues?: string[];
}
