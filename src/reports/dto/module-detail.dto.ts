import { ApiProperty } from '@nestjs/swagger';

export class ScoreDistributionBucketDto {
    @ApiProperty({ example: '0-50' })
    range!: string;

    @ApiProperty({ example: 3 })
    count!: number;
}

export class StatusBreakdownDto {
    @ApiProperty({ example: 5 })
    notStarted!: number;

    @ApiProperty({ example: 8 })
    inProgress!: number;

    @ApiProperty({ example: 29 })
    completed!: number;
}

export class ModuleDetailDto {
    @ApiProperty({ example: 3 })
    moduleId!: number;

    @ApiProperty({ example: 'Phishing Awareness Basics' })
    title!: string;

    @ApiProperty({ type: [ScoreDistributionBucketDto] })
    scoreDistribution!: ScoreDistributionBucketDto[];

    @ApiProperty({ type: StatusBreakdownDto })
    statusBreakdown!: StatusBreakdownDto;
}