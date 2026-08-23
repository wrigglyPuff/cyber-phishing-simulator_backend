import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainingModuleDto {
  @ApiProperty({ example: 'Credential Theft' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Scenarios covering fake login pages and password reset scams',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
