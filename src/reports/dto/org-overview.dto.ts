import { ApiProperty } from '@nestjs/swagger';

export class OrgOverviewDto {
    @ApiProperty({ example: 42 })
    totalUsers!: number;

    @ApiProperty({
        example: 12,
        description:
            'Organisation modules with at least one learner assigned',
    })
    countModulesAssigned!: number;

    @ApiProperty({
        example: 68.4,
        description:
            'Percentage of total assignments completed within a date range',
    })
    completionRate!: number;

    @ApiProperty({
        example: 74.2,
        description:
            'Average percentage score of assignments completed within a date range',
    })
    averageScore!: number;
}