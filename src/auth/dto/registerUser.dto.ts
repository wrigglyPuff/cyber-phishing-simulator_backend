import {
  IsEmail,
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'testuser' })
  @IsString()
  @MinLength(3)
  username!: string;

  @ApiProperty({ example: 'Lisa' })
  @IsString()
  @IsNotEmpty()
  firstname!: string;

  @ApiProperty({ example: 'Simpson' })
  @IsString()
  @IsNotEmpty()
  lastname!: string;

  @ApiPropertyOptional({ example: 1, description: 'Not required for Admin' })
  @IsInt()
  @IsOptional()
  organisationId?: number;

  @ApiProperty({ example: 'testUser@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password1!' })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%*?]).*$/, {
    message:
      'Password must include at least 1 number and 1 special character (!@#$%*?)',
  })
  password!: string;
}
