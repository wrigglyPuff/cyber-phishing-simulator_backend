import { IsString, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({ example: 'a1b2c3d4-reset-token' })
    @IsString()
    @IsNotEmpty()
    token!: string;

    @ApiProperty({ example: 'newPassword1234!' })
    @IsString()
    @MinLength(6)
    @MaxLength(72)
    @Matches(/^(?=.*[0-9])(?=.*[!@#$%*?]).*$/, {
        message:
            'Password must include at least one number and one special character (!@#$%*?)',
    })
    newPassword!: string;
}