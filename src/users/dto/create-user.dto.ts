import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'johnDoe' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[A-Za-z0-9._-]+$/, {
    message: 'Username can only contain letters, numbers, dots, underscores and hyphens'
  })
  username!: string;

  @ApiProperty({ example: 'johnDoe@gmail.com' })
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @ApiProperty({ example: 'Password1!' })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%*?]).*$/, {
    message:
      'Password must include at least 1 number and 1 special character (!@#$%*?)',
  })
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u, {
    message: 'First name contains invalid characters',
  })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u, {
    message: 'Last name contains invalid characters',
  })
  lastName!: string;

  @ApiProperty({ enum: [Role.LEARNER, Role.TRAINER], example: Role.LEARNER })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional({
    example: 1,
    description: 'Global admins must supply this. Trainers may leave it out.',
  })
  @IsInt()
  @IsOptional()
  organisationId?: number;
}