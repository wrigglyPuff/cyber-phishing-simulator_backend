import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client'
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/registerUser.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.credential }, { email: dto.credential }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      organisationId: user.organisationId,
    });

    return {
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        organisationId: user.organisationId,
      },
    };
  }

  async register(dto: RegisterUserDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create(
      dto.username,
      dto.email,
      dto.password,
      dto.organisationId ?? null,
      Role.LEARNER,
      dto.firstname,
      dto.lastname,
    );

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      organisationId: user.organisationId,
    });

    return {
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        organisationId: user.organisationId,
      },
    };
  }
}
