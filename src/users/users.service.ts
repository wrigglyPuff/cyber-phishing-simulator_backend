import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(private readonly prisma: PrismaService) {
    }
    //Finds user by email
    findByEmail = (email: string) => this.prisma.user.findUnique({ where: { email } });
    private isValidPassword(password: string): boolean {
        const minLength = password.length >= 6;
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%*?]/.test(password);
        return minLength && hasNumber && hasSpecialChar;
    }
    async create(username: string, email: string, password: string, organisationId: number) {
        const existing = await this.findByEmail(email);
        if (existing) {
            throw new BadRequestException('Email already exists');
        }
        if (!this.isValidPassword(password)) {
            throw new BadRequestException('Password must be at least 6 characters and include at least 1 number and 1 special charachter (!@#$%*?)');
        }
        const org = await this.prisma.organisation.findUnique({ where: { id: organisationId } })
        if (!org) {
            throw new BadRequestException('That organisation does not exist')
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                username,
                email,
                passwordHash: hashedPassword,
                organisationId
            }
        });
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
}
