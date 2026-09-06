import { ApiProperty } from '@nestjs/swagger';

export class DashboardActivityItemDto {
  @ApiProperty({ example: 12 })
  userId!: number;

  @ApiProperty({ example: 'jane.doe' })
  username!: string;

  @ApiProperty({ example: 'Jane' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ example: 4 })
  moduleId!: number;

  @ApiProperty({ example: 'Spotting Phishing Emails' })
  moduleTitle!: string;

  @ApiProperty({ example: 'completed', enum: ['assigned', 'started', 'completed'] })
  action!: string;

  @ApiProperty({ example: '2026-08-22T12:14:00.000Z' })
  timestamp!: Date;
}

export class DashboardActivityDto {
  @ApiProperty({ type: [DashboardActivityItemDto] })
  activity!: DashboardActivityItemDto[];
}
