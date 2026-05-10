import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.credential }, { email: dto.credential }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid =
      dto.password === user.passwordHash ||
      (await bcrypt.compare(dto.password, user.passwordHash));
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    return {
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role === 'trainer' ? 'admin' : 'user',
      },
    };
  }
}
