import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  //Finds user by email
  findByEmail = (email: string) =>
    this.prisma.user.findUnique({ where: { email } });
  private isValidPassword(password: string): boolean {
    const minLength = password.length >= 6;
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%*?]/.test(password);
    return minLength && hasNumber && hasSpecialChar;
  }

  async create(
    username: string,
    email: string,
    password: string,
    organisationId: number | null,
    role: Role = Role.LEARNER,
    firstName: string = '',
    lastName: string = '',
  ) {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email already exists');
    }
    if (!this.isValidPassword(password)) {
      throw new BadRequestException(
        'Password must be at least 6 characters and include at least 1 number and 1 special charachter (!@#$%*?)',
      );
    }
    if (role !== Role.GLOBAL_ADMIN && !organisationId === null) {
      throw new BadRequestException('organisationId required for this role');
    }
    if (organisationId) {
      const org = await this.prisma.organisation.findUnique({
        where: { id: organisationId },
      });
      if (!org) {
        throw new BadRequestException('That organisation does not exist');
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        organisationId: organisationId ?? undefined,
        role,
        firstName,
        lastName,
      },
    });

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async findLearners(
    requestingUser: { role: Role; organisationId: number | null },
    orgnaisationIdFilter?: number,
  ) {
    if (requestingUser.role == Role.GLOBAL_ADMIN) {
      return this.prisma.user.findMany({
        where: {
          role: Role.LEARNER,
          ...(orgnaisationIdFilter
            ? { organisationId: orgnaisationIdFilter }
            : {}),
        },
        select: { id: true, username: true, email: true, organisationId: true },
      });
    }
    if (!requestingUser.organisationId) {
      throw new BadRequestException('Your are not linked to an organisation');
    }
    return this.prisma.user.findMany({
      where: {
        role: Role.LEARNER,
        organisationId: requestingUser.organisationId,
      },
      select: { id: true, username: true, email: true, organisationId: true },
    });
  }
}
