import { IsInt, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FindAttemptsDto {
    @ApiProperty({ example: 3, description: 'The module to list scenario attempts for', })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    moduleId!: number;

    @ApiPropertyOptional({ example: 5, description: 'Trainers/admin use this to select a learner to view, learners skip this when viewing their own profile', })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    userId?: number;
}