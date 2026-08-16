import { IsInt, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScenarioAttemptDto {
    @ApiProperty({ example: 1, description: 'The scenario being answered' })
    @IsInt()
    @IsNotEmpty()
    scenarioId!: number;

    @ApiProperty({ example: 3, description: 'The answer the learner has selected' })
    @IsInt()
    @IsNotEmpty()
    choiceId!: number;

    @ApiPropertyOptional({ example: 4, description: 'The time taken in seconds to select an answer for this scenario (optional)' })
    @IsInt()
    @IsOptional()
    timeTakenSeconds?: number;
}