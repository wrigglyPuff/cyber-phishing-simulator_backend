import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { assertOrganisationAccess } from '../common/organisation-access';

//Built by JwtStrategy.validate(), req.user shape
type Requester = {
  userId: number;
  role: string;
  organisationId: number | null;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }
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
    if (role !== Role.GLOBAL_ADMIN && organisationId === null) {
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
    const data: Prisma.UserUncheckedCreateInput = {
      username,
      email,
      passwordHash: hashedPassword,
      organisationId,
      role,
      firstName,
      lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = await this.prisma.user.create({ data });

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

  //The only user shape that ever leaves this service
  private toSafeUser(user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    organisationId: number | null;
  }) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organisationId: user.organisationId,
    };
  }

  //Trainers and global admins can view anyone in their org.
  //Learners can view themselves
  private assertCanViewOrEdit(
    target: { id: number; organisationId: number | null },
    requester: Requester,
  ) {
    if (target.id === requester.userId) {
      return;
    }
    const isStaff =
      requester.role === Role.TRAINER || requester.role === Role.GLOBAL_ADMIN;
    if (!isStaff) {
      throw new ForbiddenException(
        'You may only view or change your own account',
      );
    }
    assertOrganisationAccess(
      target.organisationId,
      requester,
      `Requester ${requester.userId} (org ${requester.organisationId}) cannot access ${target.id} (org ${target.organisationId}), user is not in your organisation`,
    );
  }

  async createUser(createUserDto: CreateUserDto, creator: Requester) {
    if (createUserDto.role === Role.GLOBAL_ADMIN) {
      throw new ForbiddenException(
        'Global admins cannot be created through this endpoint',
      );
    }

    //Work out which organisation the new user belongs to
    let organisationId: number;
    if (creator.role === Role.GLOBAL_ADMIN) {
      if (createUserDto.organisationId === undefined) {
        throw new BadRequestException(
          'To create a user an organisationId is needed (global admin only))',
        );
      }
      organisationId = createUserDto.organisationId;
    } else {
      if (creator.organisationId === null) {
        throw new BadRequestException(
          'You cannot create users as you are not linked to an organisation',
        );
      }
      if (
        createUserDto.organisationId !== undefined &&
        createUserDto.organisationId !== creator.organisationId
      ) {
        throw new ForbiddenException(
          'You may only create users inside your own organisation',
        );
      }
      organisationId = creator.organisationId;
    }

    const organisation = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });
    if (!organisation) {
      throw new BadRequestException(
        `Organisation ${organisationId} does not exist`,
      );
    }

    const clash = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      },
    });
    if (clash) {
      throw new ConflictException(
        'That username or email address is already taken',
      );
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
        organisationId,
        passwordHash,
      },
    });

    return this.toSafeUser(user);
  }

  async findOneUser(id: number, requester: Requester) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    this.assertCanViewOrEdit(user, requester);

    return this.toSafeUser(user);
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    requester: Requester,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    this.assertCanViewOrEdit(user, requester);

    //Only the account owner can change a password
    if (updateUserDto.password !== undefined && user.id !== requester.userId) {
      throw new ForbiddenException(
        'Only the account owner can change the password',
      );
    }

    if (updateUserDto.email !== undefined) {
      const clash = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (clash && clash.id !== id) {
        throw new ConflictException('That email address is already taken');
      }
    }

    const { password, ...rest } = updateUserDto;

    const data: Record<string, unknown> = { ...rest };
    if (password !== undefined) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.toSafeUser(updated);
  }

  async removeUser(id: number, requester: Requester) {
    if (id === requester.userId) {
      throw new BadRequestException('Sorry, you cannot delete your own account');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    if (requester.role !== Role.GLOBAL_ADMIN) {
      assertOrganisationAccess(
        user.organisationId,
        requester,
        'That user is not in your organisation',
      );
      if (user.role !== Role.LEARNER) {
        throw new ForbiddenException(
          'Trainers may only delete learners. Ask a global admin to remove staff accounts.',
        );
      }
    }

    const resultCount = await this.prisma.moduleResults.count({
      where: { userId: id },
    });
    if (resultCount > 0) {
      throw new ConflictException(
        `Cannot delete user ${id}: ${resultCount} training result(s) exist for them. Deleting this would destroy training history.`,
      );
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }
}