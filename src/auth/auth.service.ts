import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client'
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/registerUser.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UsersService } from '../users/users.service';
import { TokensService } from './tokens.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokens: TokensService,
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

    const refreshToken = await this.tokens.issueRefreshToken(user.id)
    return {
      success: true,
      token: token, refreshToken,
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

    const refreshToken = await this.tokens.issueRefreshToken(user.id);
    return {
      success: true,
      token: token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        organisationId: user.organisationId,
      },
    };
  }
  async logout(rawRefreshToken: string, requestUserId: number) {
    const ownerId = await this.tokens.validateRefreshToken(rawRefreshToken);

    if (ownerId === requestUserId) {
      await this.tokens.revokeRefreshToken(rawRefreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const genericMessage = {
      message: 'If an account exists for this email, a reset link has been sent.',
    };

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return genericMessage;
    }

    const rawToken = await this.tokens.issueResetToken(user.id);

    // TODO: replace with a real email once SMTP is set up.
    console.log(`[DEV ONLY] Reset token for ${user.email}: ${rawToken}`);

    return genericMessage;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const userId = await this.tokens.consumeResetToken(dto.token);

    if (userId === null) {
      throw new BadRequestException('That reset link is invalid or has expired');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Ticket requirement: kill every existing session on reset.
    await this.tokens.revokeAllRefreshTokensForUser(userId);

    return { message: 'Password reset successfully' };
  }

  async refresh(rawRefreshToken: string): Promise<AuthResponseDto> {
    const userId = await this.tokens.validateRefreshToken(rawRefreshToken);

    if (userId === null) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotation: the old token dies the moment it is used.
    await this.tokens.revokeRefreshToken(rawRefreshToken);
    const refreshToken = await this.tokens.issueRefreshToken(user.id);

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      organisationId: user.organisationId,
    });

    return {
      success: true,
      token,
      refreshToken,
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
