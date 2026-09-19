import { ApiProperty } from '@nestjs/swagger';

export class UserDetailModuleDto {
    @ApiProperty({ example: 3 })
    moduleId!: number;

    @ApiProperty({ example: 'Phishing Awareness Basics' })
    title!: string;

    @ApiProperty({ example: 90 })
    percentageScore!: number;

    @ApiProperty({
        enum: ['notStarted', 'inProgress', 'completed'],
        example: 'completed',
    })
    status!: 'notStarted' | 'inProgress' | 'completed';
}

export class UserDetailReportDto {
    @ApiProperty({ example: 5 })
    userId!: number;

    @ApiProperty({ example: 'johnDoe' })
    username!: string;

    @ApiProperty({ type: [UserDetailModuleDto] })
    modules!: UserDetailModuleDto[];
}