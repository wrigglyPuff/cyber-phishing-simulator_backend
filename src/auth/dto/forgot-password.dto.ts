import { IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'person_name@gmail.com' })
    @IsEmail()
    @MaxLength(150)
    email!: string;
}