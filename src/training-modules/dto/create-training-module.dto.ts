import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayUnique, IsInt, IsPositive, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


//Charachters SQL injection requires are rejected
export const SAFE_TEXT_REGEX = /^[A-Za-z0-9 ]+$/;

export class CreateTrainingModuleDto {
  @ApiProperty({ example: 'New training module' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  @Matches(SAFE_TEXT_REGEX, {
    message: 'Charachters allowed are letters and numbers only',
  })
  title!: string;

  @ApiProperty({
    example: 'This module covers advanced techniques in data analysis.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Matches(SAFE_TEXT_REGEX, {
    message:
      'description may only contain letters, numbers, spaces and . , ( ) - characters',
  })
  description!: string;

  @ApiPropertyOptional({ example: [123, 546], type: [Number] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  scenarios?: number[];

  @ApiPropertyOptional({ example: [3, 45, 7], type: [Number] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  assignedUsers?: number[];
}
