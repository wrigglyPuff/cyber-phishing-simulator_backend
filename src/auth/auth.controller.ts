import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/registerUser.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() dto: LoginDto):
        Promise<AuthResponseDto> {
        return this.authService.login(dto);
    }
    @Post('register')
    async register(@Body() dto: RegisterUserDto):
        Promise<AuthResponseDto> {
        return this.authService.register(dto);
    }
}