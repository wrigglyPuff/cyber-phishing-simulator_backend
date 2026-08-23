import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttemptDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the learner making a moduleattempt',
  })
  @IsInt()
  @IsNotEmpty()
  moduleId!: number;
}
