import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

//never change username, role and organisationId here.
export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'johnDoe@gmail.com' })
    @IsEmail()
    @MaxLength(150)
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: 'Password1!' })
    @IsString()
    @MinLength(6)
    @MaxLength(72)
    @Matches(/^(?=.*[0-9])(?=.*[!@#$%*?]).*$/, {
        message:
            'Password must include at least 1 number and 1 special character (!@#$%*?)',
    })
    @IsOptional()
    password?: string;

    @ApiPropertyOptional({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    @Matches(/^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u, {
        message: 'First name contains invalid characters',
    })
    @IsOptional()
    firstName?: string;

    @ApiPropertyOptional({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    @Matches(/^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u, {
        message: 'Last name contains invalid characters',
    })
    @IsOptional()
    lastName?: string;
}