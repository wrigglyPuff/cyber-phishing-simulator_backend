import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'trainer@test.com' })
  @IsString()
  credential!: string;

  @ApiProperty({ example: 'Password1!' })
  @IsString()
  @MinLength(6)
  password!: string;
}
