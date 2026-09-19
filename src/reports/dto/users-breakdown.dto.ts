import { ApiProperty } from '@nestjs/swagger';

export class UserBreakdownItemDto {
    @ApiProperty({ example: 5 })
    userId!: number;

    @ApiProperty({ example: 'johnDoe' })
    username!: string;

    @ApiProperty({ example: 80.0 })
    completionRate!: number;

    @ApiProperty({ example: 88.5 })
    averageScore!: number;

    @ApiProperty({
        example: false,
        description:
            'True when the learner has at least one completed module and their average score is below 70%',
    })
    atRisk!: boolean;
}

export class UsersBreakdownDto {
    @ApiProperty({ type: [UserBreakdownItemDto] })
    users!: UserBreakdownItemDto[];
}