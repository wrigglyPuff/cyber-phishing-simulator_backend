import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
    @ApiProperty({ example: 'testuser' })
    @IsString()
    @MinLength(3)
    username!: string;

    @ApiProperty({ example: 'testUser@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'Password1!' })
    @IsString()
    @MinLength(6)
    @Matches(/^(?=.*[0-9])(?=.*[!@#$%*?]).*$/, {
        message: 'Password must include at least 1 number and 1 special character (!@#$%*?)',
    })
    password!: string;
}