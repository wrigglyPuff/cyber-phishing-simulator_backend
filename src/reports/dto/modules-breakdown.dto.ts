import { ApiProperty } from '@nestjs/swagger';

export class ModuleBreakdownItemDto {
    @ApiProperty({ example: 3 })
    moduleId!: number;

    @ApiProperty({ example: 'Phishing awareness Basics' })
    title!: string;

    @ApiProperty({ example: 72.1 })
    completionRate!: number;

    @ApiProperty({ example: 81.4 })
    averageScore!: number;

    @ApiProperty({
        example: 65.0,
        description:
            'Percentage of learners completing this module with a score of 80% or higher',
    })
    passRate!: number;
}

export class ModulesBreakdownDto {
    @ApiProperty({ type: [ModuleBreakdownItemDto], })
    modules!: ModuleBreakdownItemDto[];
}
