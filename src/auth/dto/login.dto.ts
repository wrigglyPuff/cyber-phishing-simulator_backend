import { IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    credential!: string;

    @IsString()
    @MinLength(6)
    password!: string;
}